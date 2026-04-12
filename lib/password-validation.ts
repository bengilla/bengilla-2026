export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('密码长度至少为 8 个字符');
  }

  if (password.length > 128) {
    errors.push('密码长度不能超过 128 个字符');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  }

  if (/[\s]/.test(password)) {
    errors.push('密码不能包含空格');
  }

  if (/[<>'"`;]/.test(password)) {
    errors.push('密码不能包含特殊字符 < > \' \" ` ;');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
