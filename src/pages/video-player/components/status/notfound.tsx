import NotExist from "../../assets/not-exist.svg?react";
interface NotFoundProps {
    msg: string;
}
export default function NotFound({ msg }: NotFoundProps) {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className=" flex items-center">
                <span className="w-20 h-20">
                    {" "}
                    <NotExist />
                </span>
                <span className="ml-4 text-2xl text-[#cdcdcd]">{msg}</span>
            </div>
        </div>
    );
}
