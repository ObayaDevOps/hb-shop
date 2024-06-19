import Head from 'next/head'
import Image from 'next/image'
import React, { useRef } from "react";
import { useInView } from "framer-motion";


import { Box,AbsoluteCenter, Button,
Flex,   ScaleFade,


  } from '@chakra-ui/react'
import { getCloudinaryImage, getCloudinaryImageBlur } from '../util/cloudinaryImageRetreival';

import NextLink from 'next/link'

import SideBar from '../components/sidebar.js' 

export default function Home() {
  const ref1 = useRef(null)
  const isInView1 = useInView(ref1)

  return (

    <ScaleFade initialScale={0.6}
    in={isInView1}>

    <Box  height={'100vh'} bgColor={'yellow.300'} border={'4px'}>
      <Head>
        <title>Nekosero | A creative shopping, dining, brewing, fashion, and contemporary arts space</title>
        <meta name="description" content="A creative shopping, dining, brewing, fashion, and contemporary arts space." />
        {/* <meta name="viewport" content="width=device-width, initial-scale=1" /> */}

        <meta property="og:title" content="Nekosero" /> 
        <meta property="og:description" content="A creative Shopping, Dining, Brewing, Fashion, and Contemporary Arts Space" />
        <meta property="og:image" content="https://res.cloudinary.com/medoptics-image-cloud/image/upload/v1710195370/nekosero5_-_Landscape_Post_1_d9yvq5.png" />
        <meta property="og:image:secure_url" content="https://res.cloudinary.com/medoptics-image-cloud/image/upload/v1710196588/nekosero5_-_Landscape_Post_1_vviwsg.png" />
        <meta property="og:url" content="https://www.nekosero.ug/" />
        <meta property="og:type" content="website" />
        
        <link rel="icon" href="/neko-logo.svg" />
      </Head>
      
      <Box>
        <SideBar />
      </Box>

      <Box>

        <AbsoluteCenter mt={{base: 0, md: 'auto'}} 
        // ml={{base:0,lg: 60}}
        

        >
          <Box ref={ref1}>
          <NextLink href='/#'>
            <Image
              src={getCloudinaryImage('nekosero5.png')} 
              alt="Nekosero Brand Logo"
              width={250}
              height= {250}
              priority
              placeholder="blur"
              
              blurDataURL={getCloudinaryImageBlur('nekosero5.png')}
              />
            </NextLink>
            </Box>

            <Flex 
            justify='center'
            mt={20}
            >
              <Button
               as='a'  
                _hover={{
                transform: 'scale(1.15)',
              }}
               colorScheme='black' rounded={'none'} fontFamily='sidebarFont' border={'2px'} variant='outline' href='/events'>
                See What's On
              </Button>
            </Flex>
        </AbsoluteCenter>

      </Box>

    </Box>

    </ScaleFade>
  )
}
