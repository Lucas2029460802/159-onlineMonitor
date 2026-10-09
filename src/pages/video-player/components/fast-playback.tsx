// interface FastPlayBackHintProps {
//     isManualFastPlayBack: boolean
// }
import { useEffect, useRef, useState } from "react";

export default function FastPlayBackHint() {
    const [opacityArr, setOpacityArr] = useState([0.15, 11 / 30, 7 / 12]);
    const transformArr = [
        "matrix(1,0,0,1,94.5,32.5)",
        "matrix(1,0,0,1,55.5,32.5)",
        "matrix(1,0,0,1,16.5,32.5)",
    ];
    const animationRef = useRef(-1);
    const updateOpacityArr = () => {
        setOpacityArr((prev) => prev.map((op) => (op + 0.2) % 1));
    };
    const lastTimeStamp = useRef(-1);
    useEffect(() => {
        const animate = (timeStamp: number) => {
            if (lastTimeStamp.current === -1) {
                lastTimeStamp.current = timeStamp;
            }
            const elapsed = timeStamp - lastTimeStamp.current;
            if (elapsed > 100) {
                updateOpacityArr();
                lastTimeStamp.current = timeStamp;
            }
            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current !== -1) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div
            id="dml-player-quickbackrate"
            className="bg-[rgba(33,33,33,.9)] rounded-sm text-white leading-[34px] h-[34px]  w-[130px]
                        absolute left-1/2 top-[18px] z-[77] -ml-[65px] text-xs flex justify-center"
        >
            <span className="inline-block mr-2 w-[30px] text-white leading-[34px] ">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 111 66"
                    width="111"
                    height="66"
                    preserveAspectRatio="xMidYMid meet"
                    style={{
                        width: "100%",
                        height: "100%",
                        transform: "translate3d(0px, 0px, 0px)",
                    }}
                >
                    <defs>
                        <clipPath id="__lottie_element_304">
                            <rect width="111" height="66" x="0" y="0"></rect>
                        </clipPath>
                    </defs>
                    <g clipPath="url(#__lottie_element_304)">
                        {opacityArr.map((op, index) => (
                            <g
                                transform={transformArr[index]}
                                opacity={op}
                                style={{ display: "block" }}
                                key={"index" + index}
                            >
                                <g opacity="1" transform="matrix(0,3,-3,0,0,0)">
                                    <path
                                        fill="rgb(255,255,255)"
                                        fillOpacity="1"
                                        d=" M6.138000011444092,3.5460000038146973 C6.4679999351501465,4.105999946594238 6.2779998779296875,4.826000213623047 5.7179999351501465,5.156000137329102 C5.538000106811523,5.265999794006348 5.3379998207092285,5.326000213623047 5.118000030517578,5.326000213623047 C5.118000030517578,5.326000213623047 -5.122000217437744,5.326000213623047 -5.122000217437744,5.326000213623047 C-5.771999835968018,5.326000213623047 -6.302000045776367,4.796000003814697 -6.302000045776367,4.145999908447266 C-6.302000045776367,3.936000108718872 -6.242000102996826,3.7260000705718994 -6.142000198364258,3.5460000038146973 C-6.142000198364258,3.5460000038146973 -1.3519999980926514,-4.553999900817871 -1.3519999980926514,-4.553999900817871 C-0.9120000004768372,-5.294000148773193 0.04800000041723251,-5.544000148773193 0.7979999780654907,-5.104000091552734 C1.027999997138977,-4.973999977111816 1.218000054359436,-4.783999919891357 1.3480000495910645,-4.553999900817871 C1.3480000495910645,-4.553999900817871 6.138000011444092,3.5460000038146973 6.138000011444092,3.5460000038146973z"
                                    ></path>
                                </g>
                            </g>
                        ))}
                    </g>
                </svg>
            </span>
            十倍速播放
        </div>
    );
}
