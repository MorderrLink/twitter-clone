import Image from "next/image";

type FileSampleProps = {
  image: string;
}

export default function FileSample ({image}: FileSampleProps) {
  return (
    <li>
        <Image src={image} width={50} height={50} alt="Load Error" />
    </li>
  )
}

