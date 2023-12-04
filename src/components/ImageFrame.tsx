import { useState } from "react";


type ImageFrameProps = {
    file: string;

}

function ImageFrame({file}: ImageFrameProps) {

  const [imgModal, setImgModal] = useState<boolean>(false);

  function interactImageModal() {
    if (imgModal) {
        setImgModal(false)
    } else {
        setImgModal(true)
    }
  }

  return (
    <div className="w-3/5">
        <div onClick={interactImageModal}>
            <img  src={file} alt="Oops! Failed to Load..." />
        </div>

        {/* MODAL */}
        <div onClick={() => { setImgModal(false) }} className={`h-full w-full flex top-0 left-0 z-40 fixed items-center justify-center ${imgModal ? "" : "hidden"} bg-opacity-80 bg-black overflow-y-hidden`}>
          <div className={`w-8/12 h-min sm:w-full sm:h-max absolute flex flex-col-reverse items-center justify-center bg-opacity-95 bg-slate-100`}>
            <img className={`w-full h-full`} src={file} alt="Oops! Failed to Load..." />
          </div>
        </div>
    </div>
  )
}

export default ImageFrame;