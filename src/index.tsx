import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ConfirmProvider } from "./components/confirm";
import { Message } from "./components/message";
import { AgentSystemLayout } from "./layout/agent";
import { BaseLayout } from "./layout/baselayout";
import { Index } from "./layout/indexpage/indexpage";
import { OnlineSystemLayout } from "./layout/online/onlinelayout";
import { NotFoundPage } from "./pages/404";
import CaptionPage from "./pages/captions";
import "./index.css";
import { Login } from "./pages/login";
import AlertCenter from "./pages/online/alert-center";
import AlgSet from "./pages/online/alg-set";
import OnlineSearch from "./pages/online/search";
import SurveillanceManage from "./pages/online/surveillance-manage";
import Chat from "./pages/search-pic";
import { Status } from "./pages/status";
import { Users } from "./pages/users";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<BaseLayout />}>
                <Route index element={<Navigate to="/login" replace />} />
                <Route path="index" element={<Index />} />
                <Route path="online" element={<OnlineSystemLayout />}>
                    <Route
                        index
                        element={
                            <Navigate
                                to="/online/surveillance-manage"
                                replace
                            />
                        }
                    />
                    <Route
                        path="surveillance-manage"
                        element={<SurveillanceManage />}
                    />
                    <Route path="alert-center" element={<AlertCenter />} />
                    <Route path="alg-set" element={<AlgSet />} />
                    <Route
                        path="people-count"
                        element={
                            <Navigate
                                to="/online/surveillance-manage"
                                replace
                            />
                        }
                    />
                    <Route path="search" element={<OnlineSearch />} />
                </Route>
                <Route path="agent" element={<AgentSystemLayout />}>
                    <Route
                        index
                        element={<Navigate to="/agent/chat" replace />}
                    />
                    <Route path="chat" element={<Chat />} />
                </Route>
                <Route
                    path="captions"
                    element={
                        <>
                            <Message />
                            <CaptionPage />
                        </>
                    }
                />
                <Route
                    path="offline/*"
                    element={
                        <Navigate to="/online/surveillance-manage" replace />
                    }
                />
                {/* 用户管理路由始终注册，权限控制在页面内部和导航入口 */}
                <Route path="user-manage" element={<Users />} />

                <Route path="server-status" element={<Status />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
};

const rootEl = document.getElementById("root");
if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <ConfirmProvider>
                    <AppRoutes />
                </ConfirmProvider>
            </BrowserRouter>
        </React.StrictMode>,
    );
}
