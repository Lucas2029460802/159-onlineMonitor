import styled from "styled-components";

import { Login as LoginComponent } from "@/components/login";
import { Message } from "@/components/message";

const LoginContainer = styled.div`
    height: 100vh;
    background-image: url("/login-background.webp");
    background-repeat: no-repeat;
    background-position: left top;
    background-size: cover;
`;

export const Login = () => {
    return (
        <LoginContainer>
            <Message />
            <div className="flex items-center justify-center">
                <LoginComponent />
            </div>
        </LoginContainer>
    );
};
