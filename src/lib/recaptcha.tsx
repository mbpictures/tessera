declare global {
    interface Window {
        grecaptcha?: any;
    }
}

const getToken = async (apiKey, action, useEnterprise): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const captcha = useEnterprise ? window.grecaptcha.enterprise : window.grecaptcha;
        captcha.ready(() => {
            captcha.execute(apiKey, {action}).then(resolve).catch(reject);
        });
    })
}

export const executeRequest = async (apiKey, action, useEnterprise) => {
    return new Promise<string>((resolve, reject) => {
        if (!apiKey) {
            resolve(null);
            return;
        }
        if (!window.grecaptcha) {
            const script = document.createElement("script");
            script.src = `https://www.google.com/recaptcha/${useEnterprise ? "enterprise" : "api"}.js?render=${apiKey}`;
            document.getElementsByTagName("head")[0].append(script);
            script.onload = () => {
                getToken(apiKey, action, useEnterprise).then(resolve).catch(reject);
            };
            return;
        }
        getToken(apiKey, action, useEnterprise).then(resolve).catch(reject);
    })
}

export enum RecaptchaResultType {
    Success,
    Timeout,
    Invalid
}

export const verifyToken = async (serverKey, token, useEnterprise, maxTime = 60 * 5) => {
    if (!serverKey) return RecaptchaResultType.Success; // ensure normal behaviour when recaptcha isn't set up
    if (!token) return RecaptchaResultType.Invalid;
    const response = await fetch(
        useEnterprise ? "https://recaptchaenterprise.googleapis.com" : "https://www.google.com/recaptcha/api/siteverify",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${serverKey}&response=${token}`
    });
    const json = await response.json();
    if (json["error-codes"] && json["error-codes"].includes("timeout-or-duplicate"))
        return RecaptchaResultType.Timeout;
    if (!json.success) return RecaptchaResultType.Invalid;
    if (new Date(json.challenge_ts).getTime() < (new Date().getTime() - 1000 * maxTime))
        return RecaptchaResultType.Timeout;
    return RecaptchaResultType.Success;
}
