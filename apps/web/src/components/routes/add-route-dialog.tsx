'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { type SubmitHandler, type UseFormProps, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createRoute } from '@/features/routes/actions';
import { type CreateRouteSchema, createRouteSchema } from '@/features/routes/schemas';
import { FormDialog } from '../common/form-dialog';

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: a form is not complex but rather repetitive so, this is ignored
export function AddRouteDialog() {
  const [isPending, startTransition] = useTransition();

  const defaultValues: CreateRouteSchema = {
    name: '',
    description: '',
    start_lat: 0,
    start_lng: 0,
    estimated_duration_minutes: 60,
    waypoints: [{ lat: 0, lng: 0, sequence_order: 1 }],
  };

  const form = useForm<CreateRouteSchema>({
    resolver: zodResolver(createRouteSchema),
    defaultValues,
  } as UseFormProps<CreateRouteSchema>);

  const { fields, append, remove } = useFieldArray<CreateRouteSchema, 'waypoints'>({
    control: form.control,
    name: 'waypoints',
  });

  const onSubmit: SubmitHandler<CreateRouteSchema> = (data) => {
    startTransition(async () => {
      const result = await createRoute(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Ruta creada');
        form.reset(defaultValues);
      }
    });
  };

  return (
    <FormDialog
      title="Registro de datos"
      description="Las rutas de recolección son las rutas que los conductores seguirán para recoger la basura. Es necesario asignar un conductor a cada ruta"
      trigger={
        <Button className="cursor-pointer" size="sm">
          <Plus className="me-2 size-4" />
          Añadir ruta
        </Button>
      }
      contentClassName="sm:max-w-lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-[70vh]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la ruta</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitud inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        {...field}
                        value={field.value?.toString() ?? ''}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitud inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        {...field}
                        value={field.value?.toString() ?? ''}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estimated_duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración estimada (minutos)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      {...field}
                      value={field.value?.toString() ?? ''}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-md font-semibold mt-6">Puntos del recorrido</h3>
            {fields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[70px_auto_auto_1fr] gap-2 items-end border p-3 rounded-md">
                <FormField
                  control={form.control}
                  name={`waypoints.${index}.sequence_order`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orden</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          {...field}
                          value={field.value?.toString() ?? ''}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`waypoints.${index}.lat`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitud</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="decimal"
                          {...field}
                          value={field.value?.toString() ?? ''}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`waypoints.${index}.lng`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitud</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="decimal"
                          {...field}
                          value={field.value?.toString() ?? ''}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={isPending || fields.length === 1}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  lat: 0,
                  lng: 0,
                  sequence_order: fields.length > 0 ? Math.max(...fields.map((w) => w.sequence_order)) + 1 : 1,
                })
              }
              disabled={isPending}
            >
              <Plus className="me-2 size-4" />
              Añadir nuevo punto
            </Button>
          </div>

          <div className="shrink-0 border-t pt-3">
            <Button type="submit" className="w-full" disabled={isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </Form>
    </FormDialog>
  );
}
