import { z } from "zod";

const disallowedUsernamePatterns = [
  "admin",
  "superuser",
  "superadmin",
  "root",
  "jabirdev",
  "cakfan",
  "withcakfan",
  "user",
];

export const SignUpSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Correo electrónico es requerido" })
      .email({ message: "Correo electrónico no válido" }),
    name: z.string().min(4, { message: "Debe tener al menos 4 caracteres" }),
    username: z
      .string()
      .min(4, { message: "Debe tener al menos 4 caracteres" })
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Solo se permiten letras, números, guiones y guiones bajos",
      )
      .refine(
        (username) => {
          for (const pattern of disallowedUsernamePatterns) {
            if (username.toLowerCase().includes(pattern)) {
              return false;
            }
          }
          return true;
        },
        { message: "El nombre de usuario contiene palabras no permitidas" },
      ),
    password: z.string().min(8, {
      message: "Debe tener al menos 8 caracteres",
    }),
    confirmPassword: z.string().min(8, {
      message: "Debe tener al menos 8 caracteres",
    }),
    gender: z.enum(["male", "female"], {
      message: "El género debe ser 'masculino' o 'femenino'.",
    }),
    role: z.enum(["admin", "supervisor", "driver"], {
      message: "El rol debe ser uno de: admin, supervisor o driver.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignUpValues = z.infer<typeof SignUpSchema>;
