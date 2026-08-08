export const EMAILJS_CONFIG_KEY = 'bsv_emailjs_config';

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export const getEmailConfig = (): EmailJSConfig => {
  try {
    const saved = localStorage.getItem(EMAILJS_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.serviceId || parsed.templateId || parsed.publicKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load email config from localStorage', e);
  }
  return {
    serviceId: '',
    templateId: '',
    publicKey: '',
  };
};

export const saveEmailConfig = (config: EmailJSConfig) => {
  localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(config));
};

export interface SendOtpParams {
  toEmail: string;
  toName: string;
  otpCode: string;
}

export const sendOtpViaEmailJS = async (params: SendOtpParams): Promise<{ success: boolean; message: string }> => {
  const config = getEmailConfig();

  if (!config.serviceId || !config.templateId || !config.publicKey) {
    return {
      success: false,
      message: 'NO_CONFIG',
    };
  }

  const templateParams = {
    to_email: params.toEmail,
    to_name: params.toName,
    otp_code: params.otpCode,
    reply_to: 'support@bansacviet.vn',
    app_name: 'Bản Sắc Việt',
    subject: `[Bản Sắc Việt] Mã OTP khôi phục mật khẩu: ${params.otpCode}`,
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      return {
        success: true,
        message: `Đã gửi thành công email chứa mã OTP đến ${params.toEmail}`,
      };
    } else {
      const errText = await response.text();
      return {
        success: false,
        message: `Lỗi từ EmailJS: ${errText}`,
      };
    }
  } catch (error: any) {
    console.warn('EmailJS sending error:', error);
    const errText = error?.message || String(error);
    return {
      success: false,
      message: errText,
    };
  }
};
