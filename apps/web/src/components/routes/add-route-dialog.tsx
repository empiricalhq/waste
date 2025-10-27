'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useTransition } from 'react';
import { type SubmitHandler, type UseFormProps, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { RouteMapSelector } from '@/components/routes/route-map-selector';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createRoute } from '@/features/routes/actions';
import { type CreateRouteSchema, createRouteSchema } from '@/features/routes/schemas';
import { FormDialog } from '../common/form-dialog';

const DEFAULT_START_COORDINATES = { lat: -12.0464, lng: -77.0428 };

function createDefaultValues(): CreateRouteSchema {
  return {
    name: '',
    description: '',
    start_lat: DEFAULT_START_COORDINATES.lat,
    start_lng: DEFAULT_START_COORDINATES.lng,
    estimated_duration_minutes: 60,
    waypoints: [],
  };
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: the form is repetitive by nature
export function AddRouteDialog() {
  const [isPending, startTransition] = useTransition();

  const defaultValues = useMemo(() => createDefaultValues(), []);

  const form = useForm<CreateRouteSchema>({
    resolver: zodResolver(createRouteSchema),
    defaultValues,
  } as UseFormProps<CreateRouteSchema>);

  const { fields, append, remove } = useFieldArray<CreateRouteSchema, 'waypoints'>({
    control: form.control,
    name: 'waypoints',
  });

  const startLat = form.watch('start_lat');
  const startLng = form.watch('start_lng');
  const watchedWaypoints = form.watch('waypoints') ?? [];

  const startPosition = useMemo(() => {
    if (typeof startLat === 'number' && typeof startLng === 'number') {
      return { lat: startLat, lng: startLng };
    }
    return null;
  }, [startLat, startLng]);

  const waypointsForMap = useMemo(
    () =>
      watchedWaypoints
        .map((waypoint, index) => ({
          ...waypoint,
          index,
        }))
        .filter(
          (waypoint): waypoint is typeof waypoint & { lat: number; lng: number; sequence_order: number } =>
            typeof waypoint.lat === 'number' &&
            typeof waypoint.lng === 'number' &&
            typeof waypoint.sequence_order === 'number',
        ),
    [watchedWaypoints],
  );

  const getNextSequenceOrder = () => {
    const currentWaypoints = form.getValues('waypoints') ?? [];
    if (currentWaypoints.length === 0) {
      return 1;
    }
    return Math.max(...currentWaypoints.map((waypoint) => Number(waypoint.sequence_order) || 0)) + 1;
  };

  const handleSelectStart = ({ lat, lng }: { lat: number; lng: number }) => {
    form.setValue('start_lat', lat, { shouldDirty: true, shouldValidate: true });
    form.setValue('start_lng', lng, { shouldDirty: true, shouldValidate: true });
  };

  const handleAddWaypoint = ({ lat, lng }: { lat: number; lng: number }) => {
    append({ lat, lng, sequence_order: getNextSequenceOrder() }, { shouldFocus: false });
    form.clearErrors('waypoints');
  };

  const handleMoveWaypoint = (index: number, position: { lat: number; lng: number }) => {
    form.setValue(`waypoints.${index}.lat`, position.lat, { shouldDirty: true, shouldValidate: true });
    form.setValue(`waypoints.${index}.lng`, position.lng, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit: SubmitHandler<CreateRouteSchema> = (data) => {
    startTransition(async () => {
      const result = await createRoute(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Ruta creada');
        form.reset(createDefaultValues());
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
      contentClassName="sm:max-w-7xl w-full"
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

            <RouteMapSelector
              startPosition={startPosition}
              waypoints={waypointsForMap}
              onSelectStart={handleSelectStart}
              onAddWaypoint={handleAddWaypoint}
              onMoveWaypoint={handleMoveWaypoint}
              height="70vh"
            />
            {form.formState.errors.waypoints?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.waypoints.message}</p>
            )}

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
                        readOnly
                        disabled={isPending}
                        className="cursor-default"
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
                        readOnly
                        disabled={isPending}
                        className="cursor-default"
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
            {fields.length === 0 ? (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Añade puntos haciendo clic en el mapa.
              </p>
            ) : (
              fields.map((item, index) => (
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
                            readOnly
                            disabled={isPending}
                            className="cursor-default"
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
                            readOnly
                            disabled={isPending}
                            className="cursor-default"
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
                    disabled={isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="shrink-0 border-t pt-3">
            <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </Form>
    </FormDialog>
  );
}
