import Image from "next/image";
const Loader = () => (
  <Image
    alt={"Loading animation"}
    src={"/logo.png"}
    width={100}
    height={100}
    className={"animate-pulse object-contain mx-auto"}
  />
);
export default Loader;
