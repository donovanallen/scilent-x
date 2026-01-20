import { Dithering } from '@paper-design/shaders-react';
export default function Home() {
  return (
    <>
      <Dithering
        width={'full'}
        height={'full'}
        colorBack='#000000'
        colorFront='#db7500'
        shape='simplex'
        type='2x2'
        size={2.4}
        speed={0.6}
        scale={0.76}
        className='absolute inset-0 w-full h-full object-cover z-0 opacity-40'
      />
      <div className='container flex flex-col items-center justify-center h-full z-10 relative'>
        <span className='font-display font-black text-6xl text-foreground/50 tracking-widest'>scilent music</span>
      </div>
    </>
  );
}
