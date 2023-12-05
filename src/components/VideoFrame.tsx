import { RiFullscreenLine } from "react-icons/ri";
import { useState } from "react";


type VideoFrameProps = {
    file: string;

}


function VideoFrame({file}: VideoFrameProps) {

  const [modal, setModal] = useState<boolean>(false);

  function interactVideoModal() {
    if (modal) {
      setModal(false)
    } else {
      setModal(true)
    }
  }

  return (
    <div className="w-3/5">
        <video onDoubleClick={interactVideoModal} src={file} autoPlay loop/>
        <div className="flex flex-row justify-between px-2 py-1">
          <p className="text-gray-500">Open to play!</p>
          <button onClick={interactVideoModal}><RiFullscreenLine className="w-6 h-6 hover:scale-110 hover:text-gray-500 focus-visible:scale-110 transition-all"/></button>
        </div>
        {/* MODAL */}
        <div onClick={() => { setModal(false) }} className={`h-full w-full flex top-0 left-0 z-40 fixed items-center justify-center ${modal ? "" : "hidden"} bg-opacity-80 bg-black overflow-y-hidden`}>
          <div className={`w-7/12 h-7/12 absolute flex flex-col-reverse items-center justify-center bg-opacity-95 bg-slate-100`}>
            <video controls className={`w-full h-full`} src={file}> vid </video>
          </div>
        </div>
    </div>
  )
}

export default VideoFrame;