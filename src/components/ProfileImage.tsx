import Image from "next/image";
import { VscAccount } from "react-icons/vsc";
type ProfileImageProps = {
    src?: string | null,
    className?: string
};

const ProfileImage = ({src, className=""}:ProfileImageProps) => {
  return (
    <div className={`relative h12 w-12 overflow-hidden rounded-full ${className}`}>
        {src === null ? <VscAccount className="h-full w-full"/> : <Image src={src} className="h12 w-12 overflow-hidden rounded-full outline-none" alt="Profile Image" quality={100} width={70} height={70}/>}
    </div>
  )
}

export default ProfileImage