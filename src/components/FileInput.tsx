import type { ChangeEventHandler } from "react";
import { VscFile } from "react-icons/vsc";

type FileInputProps = {
  onChange: ChangeEventHandler<HTMLInputElement> | undefined;
}


export default function FileInput({onChange}: FileInputProps) { 
  return (
    <div className="w-min">
      <input
      type="file"
      name="media"
      id="fileInput"
      accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/mov"
      className="bg-transparent w-0 h-0 m-0 p-0 border-none outline-none"
      placeholder=""
      onChange={onChange}
      />
      <label htmlFor="fileInput" className="flex items-center justify-center">
        <VscFile className="lg:w-7 lg:h-7 sm:w-8 sm:h-8 text-indigo-600 font-extrabold"/>
      </label>
    </div>

  )
}
