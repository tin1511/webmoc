import emailjs from '@emailjs/browser';

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
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey
    );

    if (response.status === 200 || response.text === 'OK') {
      return {
        success: true,
        message: `Đã gửi thành công email chứa mã OTP đến ${params.toEmail}`,
      };
    } else {
      return {
        success: false,
        message: `Lỗi từ EmailJS: ${response.text}`,
      };
    }
  } catch (error: any) {
    console.warn('EmailJS sending error:', error);
    const errText = error?.text || error?.message || String(error);
    return {
      success: false,
      message: errText,
    };
  }
};
