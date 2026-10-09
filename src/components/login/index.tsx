import { useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { twMerge } from "tailwind-merge";

import { api } from "@/api";
import { IconLogo } from "@/assets/svg";
import { $UI } from "@/store/ui";
import { $User } from "@/store/user";
import { decodeJwtPayload } from "@/util/jwt";
import { UserRole } from "@/api/type";

const ColoredTextDiv = styled.div`
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 500;
`;

const LoginWrapper = styled.div`
    position: relative;
    border-radius: 22px;
    padding: 26px 26px 20px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    box-shadow:
        0 24px 80px rgba(0, 0, 0, 0.65),
        inset 0 1px 0 rgba(255, 255, 255, 0.07);
    overflow: hidden;
    .auth::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        background:
            radial-gradient(
                120% 80% at 92% 8%,
                rgba(255, 255, 255, 0.45),
                transparent 40%
            ),
            linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 40%);
        mix-blend-mode: overlay;
        opacity: 0.38;
    }
    .auth::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        background:
            radial-gradient(
                120% 80% at 92% 8%,
                rgba(255, 255, 255, 0.45),
                transparent 40%
            ),
            linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 40%);
        mix-blend-mode: overlay;
        opacity: 0.38;
    }
`;

const InputWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease-in-out;
    input,
    select {
        flex: 1;
        width: 100%;
        border: 0;
        background: transparent;
        outline: none;
        color: #e9eaec;
        font-size: 14px;
    }
    input::placeholder {
        color: #9aa0a6;
    }
    &:focus-within {
        border-color: rgba(255, 255, 255, 0.22);
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.04);
    }
`;

const LoginButtonWrapper = styled.button`
    border: 0;
    cursor: pointer;
    padding: 12px 16px;
    border-radius: 12px;
    font-weight: 700;
    background: linear-gradient(#fff, #e7e7e7);
    color: #0e0f12;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.75),
        0 10px 30px rgba(0, 0, 0, 0.45);
    transition: all 0.2s ease-in-out;
    &:hover {
        transform: translateY(-1px);
    }
    &::active {
        transform: translateY(0);
    }
`;

export const Login: FC = () => {
    const [inputUsername, setInputUsername] =
        useState<string>("");
    const [inputPassword, setInputPassword] =
        useState<string>("");
    const [disabled, setDisabled] = useState<boolean>(true);
    const navigate = useNavigate();
    const login = $UI.use((state) => state.login);

    useEffect(() => {
        setDisabled(inputUsername.length === 0 || inputPassword.length === 0);
    }, [inputUsername, inputPassword]);

    useEffect(() => {
        // 登录后跳转到离线分析页面
        if (login) navigate("/offline/tasks");
    }, [login]);

    return (
        <div
            className={
                "fixed top-0 left-0 w-[100vw] h-[100vh] flex items-center justify-center z-[99999]"
            }
        >
            <LoginWrapper className="flex h-[500px] w-[760px]">
                <div className="relative h-full w-[279px] bg-transparent rounded-l-xl">
                    <div className="relative w-full h-full flex flex-col items-center justify-center  z-50">
                        <div className="flex items-center justify-center">
                            <div className="h-12 w-12 flex items-center justify-center">
                                {/* <Logo logoAnimationSpeed={logoAnimationSpeed} /> */}
                                <IconLogo className="text-3xl" />
                            </div>
                            <div className="flex items-center justify-center overflow-hidden flex-nowrap">
                                <div className="text-[#7c96e4] text-2xl mr-3 shrink-0 tracking-widest">
                                    复铼智能
                                </div>
                                <div className="h-9 w-[2px] bg-[#DE3835] rounded-full mr-3 shrink-0"></div>
                                <div className="text-[#7c96e4] text-2xl mr-4 shrink-0">
                                    FLY AI
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-white text-sm leading-6 space-y-1">
                            <div className="font-semibold text-base text-white">
                                “鉴微”监控全要素智能搜索平台
                            </div>
                            <div className="mt-3 grid grid-cols-2 justify-center gap-x-6 gap-y-2 text-white text-sm">
                                <span>● 多模态大模型</span>
                                <span>● 开放式搜索</span>
                                <span>● 超快处理速度</span>
                                <span>● 事件全浓缩</span>
                                <span>● 异常动态分类</span>
                                <span>● 全要素分析</span>
                            </div>
                        </div>
                    </div>

                    {/* <div className="text-text-5 px-8 pt-4 relative z-50 text-sm leading-6">
                        <Introduction />
                    </div> */}
                </div>
                <div className="h-[399px] w-[386px] pt-9 pr-6 pl-[31px] auth">
                    <div className="h-8 text-white text-[22px] leading-8 font-medium mb-1">
                        欢迎登录
                    </div>
                    <div className="text-sm text-white mb-6 h-[23px]">
                        请登录后使用本系统
                    </div>
                    <div className="text-base h-8">
                        <ColoredTextDiv className="bg-[#7c96e4]">
                            密码登录
                        </ColoredTextDiv>
                        <div className="mt-1 h-[2px] bg-[#7c96e4] w-16" />
                    </div>
                    <div className="mt-5">
                        <InputWrapper className="mb-5">
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="请输入用户名"
                                onChange={(e) => {
                                    setInputUsername(e.target.value);
                                }}
                                value={inputUsername}
                            />
                        </InputWrapper>
                        <InputWrapper className="mb-6">
                            <input
                                type="password"
                                autoComplete="off"
                                placeholder="请输入密码"
                                onChange={(e) => {
                                    setInputPassword(e.target.value);
                                }}
                                value={inputPassword}
                            />
                        </InputWrapper>
                        <div className="mb-10 text-white text-sm">
                            登录即代表同意《用户协议》
                        </div>
                        <LoginButtonWrapper
                            className={twMerge(
                                "w-full px-7 h-12 rounded-full border-0 text-white text-sm font-medium transition-all bg-blue-2 hover:opacity-90",
                                disabled &&
                                    "pointer-events-none cursor-not-allowed opacity-50",
                            )}
                            onClick={async () => {
                                await api.user.login(
                                    inputUsername,
                                    inputPassword,
                                );
                                // 从新 token 解析用户信息并更新 $User store
                                const token = localStorage.getItem("token");
                                if (token) {
                                    try {
                                        const payload = decodeJwtPayload<{
                                            userid: number;
                                            username: string;
                                            role: UserRole;
                                        }>(token);
                                        $User.update("login", (draft) => {
                                            draft.Id = payload.userid;
                                            draft.Name = payload.username;
                                            draft.Role = payload.role;
                                        });
                                    } catch (e) {
                                        console.error("JWT decode failed:", e);
                                    }
                                }
                                $UI.update("login", (draft) => {
                                    draft.login = true;
                                    draft.messageDisplay = false;
                                });
                                // 登录后跳转到离线分析页面
                                navigate("/offline/tasks");
                            }}
                        >
                            立即登录
                        </LoginButtonWrapper>
                    </div>
                </div>
            </LoginWrapper>
        </div>
    );
};
