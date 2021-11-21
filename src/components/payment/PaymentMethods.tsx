import {getStripe} from "../../lib/stripe";
import {Elements} from "@stripe/react-stripe-js";
import {CheckboxAccordion} from "../CheckboxAccordion";
import {StripeCard} from "./StripeCard";
import {useState} from "react";
import {ThemeProvider} from "@mui/system";
import {createTheme} from "@mui/material/styles";

export const PaymentMethods = () => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(null);

    const handleChangeSelectedPaymentMethod = (newMethod) => {
        setSelectedPaymentMethod(newMethod);
    }

    return (
        <Elements stripe={getStripe()}>
            <ThemeProvider theme={createTheme()}>
                <CheckboxAccordion
                    label={"Credit Card"}
                    name={"creditcard"}
                    selectedItem={selectedPaymentMethod}
                    onSelect={handleChangeSelectedPaymentMethod}
                >
                    <StripeCard />
                </CheckboxAccordion>
            </ThemeProvider>
        </Elements>
    )
}
