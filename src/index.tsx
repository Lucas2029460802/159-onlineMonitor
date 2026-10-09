import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { UserRoles } from "./api/type";
import { ConfirmProvider } from "./components/confirm";
import { Message } from "./components/message";
import { AgentSystemLayout } from "./layout/agent";
import { BaseLayout } from "./layout/baselayout";
import { Index } from "./layout/indexpage/indexpage";
import { OfflineSystemLayout } from "./layout/offline/offlinelayout";
import { OnlineSystemLayout } from "./layout/online/onlinelayout";
import { NotFoundPage } from "./pages/404";
import CaptionPage from "./pages/captions";
import { Home } from "./pages/home";
import "./index.css";
import { Login } from "./pages/login";
import NewBigPic from "./pages/new-big-pic/new-big-pic";
import AlertCenter from "./pages/online/alert-center";
import AlgSet from "./pages/online/alg-set";
import PeopleCount from "./pages/online/people-count";
import OnlineSearch from "./pages/online/search";
import SurveillanceManage from "./pages/online/surveillance-manage";
import Chat from "./pages/search-pic";
import { Share } from "./pages/share";
import { Status } from "./pages/status";
import { Tasks } from "./pages/tasks";
import { Upload } from "./pages/upload";
import { Users } from "./pages/users";
import VideoPlayer from "./pages/video-player/video-player";
import { Videos } from "./pages/videos";
import { $User } from "./store/user";

const AppRoutes = () => {
    const role = $User.use((state) => state.Role);

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
                    <Route path="people-count" element={<PeopleCount />} />
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
                <Route path="offline" element={<OfflineSystemLayout />}>
                    <Route
                        index
                        element={<Navigate to="/offline/tasks" replace />}
                    />
                    <Route
                        path="captions"
                        element={<Navigate to="/captions" replace />}
                    />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path=":taskId/result" element={<Home />} />
                    <Route path=":taskId/search" element={<Chat />} />
                    <Route path=":taskId/new-bigpic" element={<NewBigPic />} />
                    <Route path=":taskId/upload" element={<Upload />} />
                    <Route path=":taskId/videos" element={<Videos />} />
                    <Route path=":taskId/share" element={<Share />} />
                    <Route path="status" element={<Status />} />
                    <Route path=":taskId/player" element={<VideoPlayer />} />
                </Route>
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
