import { VscError } from "react-icons/vsc";

import VideoFrame from "./VideoFrame";
import ImageFrame from "./ImageFrame";


type FileSampleProps = {
  file: string;
  onClick: () => void;
  fileType: string | undefined;
}

export default function FileSample ({file, onClick, fileType}: FileSampleProps) {
  if (fileType === undefined) return 
  return (
    <div>
        <button className="flex items-center justify-center w-6 h-6 outline-none rounded bg-slate-500" onClick={onClick}><VscError/></button>
        { fileType === "image" && <ImageFrame file={file}/>}
        { fileType === "video" && <VideoFrame file={file}/>}
    </div>
  )
}

// <Image src={file} width={110} height={110} alt="Load Error!" priority={false} />