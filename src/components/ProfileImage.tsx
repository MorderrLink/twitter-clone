import Image from "next/image";
import { VscAccount } from "react-icons/vsc";
type ProfileImageProps = {
    src: string | null | undefined,
    className?: string
};

const ProfileImage = ({src, className=""}:ProfileImageProps) => {
  return (
    <div className={`relative h12 w-12 overflow-hidden rounded-full hover:scale-110 focus-visible:scale-110 transition-all ${className}`}>
        {(src == null || src == undefined) ? <VscAccount className="h-full w-full"/> : <Image src={src} className="h12 w-12 overflow-hidden hover:scale-110 focus-within:scale-110 transition-all rounded-full outline-none" alt="Profile Image" quality={100} width={70} height={70}/>}
    </div>
  )
}

export default ProfileImage