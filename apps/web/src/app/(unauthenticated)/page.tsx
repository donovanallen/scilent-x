import { Dithering } from '@paper-design/shaders-react';
export default function Home() {
  return (
    <>
      <Dithering
        width={'full'}
        height={'full'}
        colorBack='#000000'
        colorFront='#db7500b5'
        shape='simplex'
        type='2x2'
        size={2.4}
        speed={0.6}
        scale={0.76}
        className='absolute inset-0 w-full h-full object-cover z-0'
      />
      <div className='container flex flex-col items-center justify-center h-full z-10 relative'>
        <h1 className='text-6xl text-foreground'>Scilent Music</h1>
      </div>
    </>
  );
}
