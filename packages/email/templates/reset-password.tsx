import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface PasswordResetEmailProps {
  userName?: string;
  resetUrl?: string;
}

PasswordResetEmail.PreviewProps = {
  userName: '{{userName}}',
  resetUrl: '{{resetUrl}}',
} as PasswordResetEmailProps;

function PasswordResetEmail({ userName, resetUrl }: PasswordResetEmailProps) {
  const previewText = 'Restablecer tu contraseña en Lima Limpia';

  return (
    <Html lang="es">
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
              Restablecer tu contraseña en <strong>Lima Limpia</strong>
            </Heading>
            {userName && <Text className="text-[14px] text-black leading-[24px]">Hola {userName},</Text>}
            <Text className="text-[14px] text-black leading-[24px]">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón para
              establecer una nueva contraseña:
            </Text>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                href={resetUrl}
              >
                Restablecer Contraseña
              </Button>
            </Section>
            <Text className="text-[14px] text-black leading-[24px]">O copia y pega este enlace en tu navegador:</Text>
            <Text className="text-[14px] text-[#666666] leading-[24px] break-all">{resetUrl}</Text>
            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[14px] leading-[24px]">
              Este enlace expirará en 1 hora por razones de seguridad.
            </Text>
            <Text className="text-[#666666] text-[14px] leading-[24px]">
              Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
              © {new Date().getFullYear()} Lima Limpia. Todos los derechos reservados.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default PasswordResetEmail;
