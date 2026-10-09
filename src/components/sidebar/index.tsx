import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { SidebarItem } from "./component/sidebar-item";

import { UserRoles } from "@/api/type";
import {
    IconCloudCheck,
    IconFolders,
    IconSetting,
    IconShare,
    IconUpload,
    IconUsers,
} from "@/assets/svg";
import { taskFilterAll } from "@/pages/videos";
import { $User } from "@/store/user";

const SideBar: FC = () => {
    const navigate = useNavigate();
    const role = $User.use((state) => state.Role);
    const location = useLocation();
    const [replace, setReplace] = useState<boolean>(false);
    const { taskId } = useParams();

    useEffect(() => {
        if (location.pathname.includes("upload")) {
            setReplace(false);
        } else {
            setReplace(true);
        }
    }, [location]);

    return (
        <div className="w-50 h-full bg-white border-r border-solid border-border-2">
            <div className="px-8 pt-6 pb-4">
                <button
                    className="w-full h-10 rounded-lg bg-blue-1 flex items-center justify-center text-white gap-2 hover:opacity-90 cursor-pointer"
                    onClick={() => {
                        const paths = location.pathname.split("/");
                        navigate(
                            taskId
                                ? "/" + paths[1] + "/" + taskId + "/upload"
                                : "/upload",
                        );
                    }}
                >
                    <IconUpload className="text-lg" />
                    <div>上传分析</div>
                </button>
            </div>
            <SidebarItem
                icon={<IconCloudCheck className="text-xl mr-4" />}
                title="结果预览"
                url={`/result`}
                replace={replace}
            />
            <SidebarItem
                icon={<IconFolders className="text-xl mr-4" />}
                title="视频管理"
                url={`/videos?group=${taskFilterAll}`}
                replace={replace}
            />
            <SidebarItem
                icon={<IconShare className="text-xl mr-4" />}
                title="我的分享"
                url={`/share`}
                replace={replace}
            />
            {role === UserRoles.Admin && (
                <SidebarItem
                    icon={<IconUsers className="text-xl mr-4" />}
                    title="账户管理"
                    url="/users"
                    replace={replace}
                />
            )}
            <SidebarItem
                icon={<IconSetting className="text-xl mr-4" />}
                title="数据中台"
                url="/status"
                replace={replace}
            />
        </div>
    );
};

export default SideBar;
