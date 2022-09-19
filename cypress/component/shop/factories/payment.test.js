import { PaymentFactory, PaymentType } from "../../../../src/store/factories/payment/PaymentFactory";

describe("Payment Factories", () => {
    it("Factories available", () => {
        Object.values(PaymentType).forEach((type) => {
            const data = {
                type: type,
                data: null
            }
            const instance = PaymentFactory.getPaymentInstance(data);
            expect(instance).to.not.equal(null);
            expect(instance.getData()).to.deep.equal(data);
        });

        expect(PaymentFactory.getPaymentInstance(null)).to.equal(null);
        expect(PaymentFactory.getPaymentInstance({
            type: "abc",
            data: null
        })).to.equal(null);
    })

    it("Invoice", () => {
        const invoice = PaymentFactory.getPaymentInstance({
            type: PaymentType.Invoice,
            data: null
        });
        expect(invoice.isValid()).to.equal(true);
        expect(invoice.getValidPaymentResult()).to.deep.equal({
            payed: true
        })
        expect(invoice.paymentResultValid(JSON.stringify({payed: true}))).to.equal(true);
        expect(invoice.paymentResultValid(JSON.stringify(null))).to.equal(false);
        expect(invoice.paymentResultValid(JSON.stringify({}))).to.equal(false);
        expect(invoice.paymentResultValid(JSON.stringify({payed: false}))).to.equal(false);
    })

    it("Sofort", () => {
        const sofort = PaymentFactory.getPaymentInstance({
            type: PaymentType.Sofort,
            data: null
        });
        expect(sofort.isValid()).to.equal(true);
        expect(sofort.getValidPaymentResult()).to.deep.equal({
            status: true
        });
        expect(sofort.paymentResultValid(JSON.stringify({transaction: {status: true}}))).to.equal(true);
        expect(sofort.paymentResultValid(JSON.stringify(null))).to.equal(false);
        expect(sofort.paymentResultValid(JSON.stringify({  }))).to.equal(false);
        expect(sofort.paymentResultValid(JSON.stringify({transaction: {status: false}}))).to.equal(false);
    })

    it("CreditCard", () => {
        const creditcard = PaymentFactory.getPaymentInstance({
            type: PaymentType.CreditCard,
            data: null
        });
        expect(creditcard.isValid()).to.equal(false);
        creditcard.setData({
            cardNumberComplete: true,
            expiredComplete: true,
            cvcComplete: true
        })
        expect(creditcard.isValid()).to.equal(true);
        expect(creditcard.getValidPaymentResult()).to.deep.equal({
            event: "charge.succeeded"
        });
        expect(creditcard.paymentResultValid(JSON.stringify({event: "charge.succeeded"}))).to.equal(true);
        expect(creditcard.paymentResultValid(JSON.stringify(null))).to.equal(false);
        expect(creditcard.paymentResultValid(JSON.stringify({  }))).to.equal(false);
        expect(creditcard.paymentResultValid(JSON.stringify({event: "charge.failed"}))).to.equal(false);
    })

    it("PayPal", () => {
        const paypal = PaymentFactory.getPaymentInstance({
            type: PaymentType.PayPal,
            data: null
        });
        expect(paypal.isValid()).to.equal(true);
        expect(paypal.getValidPaymentResult()).to.deep.equal({
            status: "COMPLETED"
        });
        expect(paypal.paymentResultValid(JSON.stringify({status: "COMPLETED"}))).to.equal(true);
        expect(paypal.paymentResultValid(JSON.stringify(null))).to.equal(false);
        expect(paypal.paymentResultValid(JSON.stringify({  }))).to.equal(false);
        expect(paypal.paymentResultValid(JSON.stringify({status: "FAILED"}))).to.equal(false);
    })

    it("StripeIBAN", () => {
        const iban = PaymentFactory.getPaymentInstance({
            type: PaymentType.StripeIBAN,
            data: null
        });
        expect(iban.isValid()).to.equal(false);
        iban.setData({
            ibanComplete: true
        })
        expect(iban.isValid()).to.equal(true);
        expect(iban.getValidPaymentResult()).to.deep.equal({
            event: "charge.succeeded"
        });
        expect(iban.paymentResultValid(JSON.stringify({event: "charge.succeeded"}))).to.equal(true);
        expect(iban.paymentResultValid(JSON.stringify(null))).to.equal(false);
        expect(iban.paymentResultValid(JSON.stringify({  }))).to.equal(false);
        expect(iban.paymentResultValid(JSON.stringify({event: "charge.failed"}))).to.equal(false);
    })
})
