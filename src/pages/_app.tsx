import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '../style/Global.scss';
import {StepperContainer} from "../components/StepperContainer";

export default function Global({ Component, pageProps }) {
    return (
        <StepperContainer>
            <Component {...pageProps} />
        </StepperContainer>
    );
}
