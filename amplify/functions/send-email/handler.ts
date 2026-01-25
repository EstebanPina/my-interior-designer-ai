import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client
const sesClient = new SESClient({ region: process.env.SES_REGION! });
const FROM_EMAIL = process.env.FROM_EMAIL!;

type Event = {
  to: string;
  subject: string;
  template: 'welcome' | 'subscription_renewed' | 'payment_failed' | 'design_completed';
  data?: Record<string, any>;
};

export const handler = async (event: Event): Promise<any> => {
  try {
    const { to, subject, template, data } = event;

    // Generate email content based on template
    const { html, text } = generateEmailContent(template, data);

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html,
          },
          Text: {
            Charset: 'UTF-8',
            Data: text,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: FROM_EMAIL,
    });

    const response = await sesClient.send(command);
    
    console.log(`Email sent to ${to}. Message ID: ${response.MessageId}`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        messageId: response.MessageId 
      }),
    };

  } catch (error) {
    console.error('Email sending error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email' }),
    };
  }
};

function generateEmailContent(template: string, data: Record<string, any> = {}) {
  const templates = {
    welcome: {
      subject: '¡Bienvenido a My Interior Designer AI! 🎨',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">¡Bienvenido a My Interior Designer AI!</h1>
          <p>Gracias por registrarte en nuestra plataforma de diseño interior con IA.</p>
          <p>Con tu cuenta gratuita puedes:</p>
          <ul>
            <li>Crear hasta 3 diseños mensuales</li>
            <li>Acceder a estilos básicos</li>
            <li>Guardar tu historial de diseños</li>
          </ul>
          <p>Para acceder a todas las funcionalidades, considera actualizar a Premium:</p>
          <a href="https://tuapp.com/upgrade" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Actualizar a Premium
          </a>
        </div>
      `,
      text: `
        ¡Bienvenido a My Interior Designer AI!
        
        Gracias por registrarte en nuestra plataforma de diseño interior con IA.
        
        Con tu cuenta gratuita puedes:
        - Crear hasta 3 diseños mensuales
        - Acceder a estilos básicos
        - Guardar tu historial de diseños
        
        Para acceder a todas las funcionalidades, considera actualizar a Premium.
      `
    },

    subscription_renewed: {
      subject: '¡Tu suscripción Premium ha sido renovada! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">¡Tu suscripción Premium ha sido renovada!</h1>
          <p>Gracias por continuar con tu suscripción Premium en My Interior Designer AI.</p>
          <p>Ya puedes disfrutar de:</p>
          <ul>
            <li>✅ Diseños ilimitados</li>
            <li>✅ Todos los estilos de diseño (34 estilos)</li>
            <li>✅ Recomendaciones premium</li>
            <li>✅ Descargas en alta calidad</li>
          </ul>
          <p>Próxima renovación: ${data?.nextBillingDate}</p>
          <a href="https://tuapp.com/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Ir al Dashboard
          </a>
        </div>
      `,
      text: `
        ¡Tu suscripción Premium ha sido renovada!
        
        Gracias por continuar con tu suscripción Premium en My Interior Designer AI.
        
        Ya puedes disfrutar de:
        - ✅ Diseños ilimitados
        - ✅ Todos los estilos de diseño (34 estilos)
        - ✅ Recomendaciones premium
        - ✅ Descargas en alta calidad
        
        Próxima renovación: ${data?.nextBillingDate}
      `
    },

    payment_failed: {
      subject: 'Error en el pago de tu suscripción 💳',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Error en el pago</h1>
          <p>Tu último pago no pudo procesarse.</p>
          <p>Para evitar la interrupción de tu suscripción, por favor actualiza tu método de pago.</p>
          <a href="https://tuapp.com/billing" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Actualizar método de pago
          </a>
          <p>Tienes 7 días para resolver esto antes de que tu suscripción se cancele.</p>
        </div>
      `,
      text: `
        Error en el pago
        
        Tu último pago no pudo procesarse.
        
        Para evitar la interrupción de tu suscripción, por favor actualiza tu método de pago.
        
        Tienes 7 días para resolver esto antes de que tu suscripción se cancele.
      `
    },

    design_completed: {
      subject: '¡Tu diseño está listo! 🎨',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">¡Tu diseño está listo!</h1>
          <p>Hemos completado el diseño de tu habitación con el estilo <strong>${data?.style}</strong>.</p>
          <div style="margin: 20px 0;">
            <img src="${data?.generatedImage}" alt="Generated design" style="max-width: 100%; border-radius: 8px;">
          </div>
          <p>El diseño incluye:</p>
          <ul>
            <li>Imagen generada en alta calidad</li>
            <li>Recomendaciones de productos</li>
            <li>Guía de implementación</li>
          </ul>
          <a href="https://tuapp.com/designs/${data?.designId}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Ver diseño completo
          </a>
        </div>
      `,
      text: `
        ¡Tu diseño está listo!
        
        Hemos completado el diseño de tu habitación con el estilo ${data?.style}.
        
        El diseño incluye:
        - Imagen generada en alta calidad
        - Recomendaciones de productos
        - Guía de implementación
        
        Visita tu dashboard para ver el diseño completo.
      `
    }
  };

  const templateContent = templates[template as keyof typeof templates];
  if (!templateContent) {
    throw new Error(`Template ${template} not found`);
  }

  return {
    subject: templateContent.subject,
    html: templateContent.html,
    text: templateContent.text
  };
}