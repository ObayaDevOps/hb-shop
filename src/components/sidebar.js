'use client'

import React, { ReactNode } from 'react'
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  Link,
  Collapse,
  Center,

  Stack,
  Tooltip,
  useClipboard,
  FlexProps,
} from '@chakra-ui/react'


import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';

import {
  FiMenu,
} from 'react-icons/fi'

import { PiBowlFoodLight } from "react-icons/pi";
import { GiSewingMachine } from "react-icons/gi";
import { FaCameraRetro } from "react-icons/fa";
import { GiBeerBottle } from "react-icons/gi";
import { VscLaw } from "react-icons/vsc";
import { FaCat } from "react-icons/fa";
import { BsBasketFill } from "react-icons/bs";
import { GiMountaintop } from "react-icons/gi";
import { GiEarthAfricaEurope } from "react-icons/gi";
import { GiColombianStatue } from "react-icons/gi";

import { GiStakeHammer } from "react-icons/gi";
import { MdElectricBike } from "react-icons/md";
import { BiSolidCarBattery } from "react-icons/bi";
import { GiFullMotorcycleHelmet } from "react-icons/gi";

import { FaInstagram } from 'react-icons/fa';
import { FaFacebook } from 'react-icons/fa';

import { HiOutlineMail } from 'react-icons/hi';  
import { RiMapPinLine } from "react-icons/ri";

import { IoMdHome } from "react-icons/io";
import { FaCalendarAlt } from "react-icons/fa";
import { PiBowlFoodFill } from "react-icons/pi";
import { MdEnergySavingsLeaf } from "react-icons/md";
import { MdBusinessCenter } from "react-icons/md";
import { BsFillCalendarDayFill } from "react-icons/bs";
import { BsFillCalendarHeartFill } from "react-icons/bs";
import { BiSolidHomeAlt2 } from "react-icons/bi";
import { FaClockRotateLeft } from "react-icons/fa6";

import { getCloudinaryImage, getCloudinaryImageBlur } from '../util/cloudinaryImageRetreival';
import Image from 'next/image'


const LinkCategories = [
  {
    label:'Home',
    icon: BiSolidHomeAlt2,
    href: '/'
  },
  {
    label:'Events',
    icon: BsFillCalendarHeartFill, 
    href: '/events'
  },
    {
    label:'Food, Drinks & Dining',
    icon: PiBowlFoodFill, 
    children: [
     { label: 'Yujo Izakaya', category:'Drinks & Dining', icon: PiBowlFoodLight, href: 'https://yujo.ug' },
     { label: 'Bananage Brewing Co.', category:'Drinks & Dining', icon: GiBeerBottle, href: 'https://www.banangebrewing.com/' },
     { label: 'Little Kobe Japanese Market', category:'Drinks & Dining', icon: BsBasketFill, href: 'https://www.facebook.com/littlekobejapanesemarket/' },
     { label: 'Ribbo Coffee', category:'Drinks & Dining', icon: GiMountaintop, href: 'https://ribbocoffee.com/' },
    ],
  },
  {
    label:'Art, Apparel & Decor',
    icon: GiColombianStatue, 
    children: [
     { label: 'AFRPCN Capsule Gallery', category:'Art, Apparel & Decor', icon: GiEarthAfricaEurope, href: 'https://www.afropocene.com/capsule-gallery/about-capsule' },
     { label: 'Buziga Hill', category:'Art, Apparel & Decor', icon: GiSewingMachine, href: 'https://buzigahill.com/' },
     { label: 'Vibes Popup', category:'Art, Apparel & Decor', icon: GiMountaintop, href: 'https://www.instagram.com/___vibespopup?igsh=MW5ncTV6eDA2cXUxdg==' },
     { label: 'T.I.A', category:'Art, Apparel & Decor', icon: GiColombianStatue, href: 'https://www.facebook.com/tiauganda/' },
     { label: 'TL Studio', category:'Art, Apparel & Decor', icon: GiMountaintop, href: 'https://www.instagram.com/tahirlalaniphotography?igsh=bHB4enp3dHRsNWUz' },
     { label: 'Kila Kitu', category:'Art, Apparel & Decor', icon: GiMountaintop, href: 'https://www.instagram.com/kila_kitu_shopping?igsh=bDYyd2s0azQ3aXBt' },


    ],
  },
  {
    label:'Renewable Energy',
    icon: MdEnergySavingsLeaf, 
    children: [
     { label: 'enPower.Life', category:'Renewable Energy', icon: GiMountaintop, href: 'http://enpower.life/' },
     { label: 'Women on Wheels', category:'Renewable Energy', icon: GiFullMotorcycleHelmet, href: 'https://womenrisingforafrica.org/our-programs/' },
     { label: 'Zembo Swap Station', category:'Renewable Energy', icon: MdElectricBike, href: 'https://www.zem.bo/' },

    ],
  },
  {
    label:'Business Services',
    icon: MdBusinessCenter, 
    children: [
      { label: 'First Circle Capital', category:'Business Services', icon: GiMountaintop, href: 'https://www.firstcirclecap.com/' },
      { label: 'Silicon Advocates', category:'Business Services', icon: VscLaw, href: 'https://www.linkedin.com/company/silicon-advocates/' },

    ],
  },
  {
    label:'Past Tenants',
    icon: FaClockRotateLeft,
    children: [
      { label: 'Kanchuwithacamera', category:'Art, Apparel & Decor', icon: FaCameraRetro, href: 'https://www.kanchuwithacamera.com/' },
      
     ],
  },
]


const LinkItems = [
  { name: 'Yujo Izakaya', category:'Drinks & Dining', icon: PiBowlFoodLight, href: 'https://yujo.ug' },
  { name: 'Buziga Hill', category:'Art, Apparel & Decor', icon: GiSewingMachine, href: 'https://buzigahill.com/' },
  { name: 'AFRPCN Capsule Gallery', category:'Art, Apparel & Decor', icon: GiEarthAfricaEurope, href: 'https://www.afropocene.com/capsule-gallery/about-capsule' },
  { name: 'Kanchu with a camera', category:'Art, Apparel & Decor', icon: FaCameraRetro, href: 'https://www.kanchuwithacamera.com/' },
  { name: 'Bananage Brewing Co.', category:'Drinks & Dining', icon: GiBeerBottle, href: 'https://www.banangebrewing.com/' },
  { name: 'T.I.A', category:'Art, Apparel & Decor', icon: GiColombianStatue, href: 'https://www.facebook.com/tiauganda/' },
  { name: 'Silicon Advocates', category:'Business Services', icon: VscLaw, href: 'https://www.linkedin.com/company/silicon-advocates/' },
  // { name: 'Maneki Neko Cafe', icon: FaCat, href: 'https://images.app.goo.gl/BNwT1ZCxPfHg6JPG6' },
  { name: 'Little Kobe Japanese Market', category:'Drinks & Dining', icon: BsBasketFill, href: 'https://www.facebook.com/littlekobejapanesemarket/' },
  { name: 'Women on Wheels', category:'Renewable Energy', icon: GiFullMotorcycleHelmet, href: 'https://womenrisingforafrica.org/our-programs/' },
  { name: 'Zembo Swap Station', category:'Renewable Energy', icon: MdElectricBike, href: 'https://www.zem.bo/' },
  { name: 'Vibes Popup', category:'Art, Apparel & Decor', icon: GiMountaintop, href: 'https://www.instagram.com/___vibespopup?igsh=MW5ncTV6eDA2cXUxdg==' },
  { name: 'TL Studio', category:'Art, Apparel & Decor', icon: GiMountaintop, href: 'https://www.instagram.com/tahirlalaniphotography?igsh=bHB4enp3dHRsNWUz' },
  { name: 'enPower.Life', category:'Renewable Energy', icon: GiMountaintop, href: 'http://enpower.life/' },
  { name: 'Ribbo Coffee', category:'Drinks & Dining', icon: GiMountaintop, href: '/https://ribbocoffee.com/' },
  { name: 'First Circle Capital', category:'Business Services', icon: GiMountaintop, href: 'https://www.firstcirclecap.com/' },
  { name: 'Kila Kitu', category:'Art, Apparel & Decor', icon: GiMountaintop, href: 'https://www.instagram.com/kila_kitu_shopping?igsh=bDYyd2s0azQ3aXBt' },





]

export default function SimpleSidebar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <Box>
      <SidebarContent onClose={() => onClose} display={{ base: 'none', lg: 'none' }} />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full">
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav display={{ base: 'flex', lg:'flex' }} onOpen={onOpen} />

    </Box>
  )
}


const SidebarContent = ({ onClose, ...rest }) => {

  return (
    <Box>
      <Box
        bg={useColorModeValue('yellow.400', 'gray.900')}
        // border={'4px'}
        w={{ base: 'full', lg: 'full' }}
        pos="fixed"
        h="90vh"
        // mb={'60vh'}
        overflowY='auto'
        top='0'
        // bottom='20'
        
        {...rest}>
        <Flex h={{base:"16", md: "24",lg:"20"}} alignItems="center" mx="8" justifyContent="space-between">
          <CloseButton 
            display={{ base: 'flex', md: 'flex', lg: 'flex' }} 
            onClick={onClose} 
            mt={12} 
            // border={'2px'} 
            rounded='none' 
            size='lg' 
            _hover={{
              transform: 'scale(1.15)',
            }}
            p={3} />
        </Flex>

        <Box pt={10}>
        {LinkCategories.map((category) => (
          <NavItem key={category.label} children={category.children} {...category} >
            {category.children}
            {/* {category.label} */}
          </NavItem>
        ))}
        </Box>
      </Box>

      <Box 
      {...rest} 
      position='fixed' 
      bottom='0' 
      p={{base: 2, md: 4}} 
      bg={'yellow.400'}
      w={{ base: 'full', lg: 'full' }}
      // border={'2px'}
      // borderTop={0}
      h={{base:'20vh', lg: '10vh'}}
      >
        <SocialsStack />
      </Box>
      

    </Box>
    
  )
}

const SocialsStack = () => {
  const { hasCopied, onCopy } = useClipboard('hello@nekosero.ug');

  return (
    <Flex
    >
      <Stack direction={'row'} spacing={6} p={{base:1, md:1}}>

        <Tooltip        
          label={hasCopied ? 'Email Copied!' : 'Copy Email'}
          closeOnClick={false}
          hasArrow>
          <IconButton
            aria-label="email"
            color={'black'}
            variant="ghost"
            size="lg"
            fontSize="xl"
            icon={<HiOutlineMail />}
            _hover={{
              bg: 'yellow.500',
              color: useColorModeValue('white', 'gray.700'),
            }}
            onClick={onCopy}
            isRound
          />
        </Tooltip>


          <IconButton
          as='a'
            aria-label="Instagram"
            variant="ghost"
            color={'black'}
            size="lg"
            fontSize="xl"
            href={'https://www.instagram.com/nekosero/'}
            icon={<FaInstagram />}
            _hover={{
              bg: 'yellow.500',
              color: useColorModeValue('white', 'gray.700'),
            }}
            isRound
          />

        <IconButton
          as='a'
            aria-label="Facebook"
            variant="ghost"
            color={'black'}
            size="lg"
            fontSize="xl"
            href={'https://maps.app.goo.gl/RT3ZEuogVDjsqX818'}
            icon={<FaFacebook />}
            _hover={{
              bg: 'yellow.500',
              color: useColorModeValue('white', 'gray.700'),
            }}
            isRound
          />      

        <IconButton
          as='a'
            aria-label="Maps"
            variant="ghost"
            color={'black'}
            size="lg"
            fontSize="xl"
            href={'https://maps.app.goo.gl/RT3ZEuogVDjsqX818'}
            icon={<RiMapPinLine />}
            _hover={{
              bg: 'yellow.500',
              color: useColorModeValue('white', 'gray.700'),
            }}
            isRound
          />


        <IconButton
          as='a'
            aria-label="Developer"
            variant="ghost"
            color={'black'}
            size="lg"
            fontSize="xl"
            href={'https://www.dralegawebops.com/'}
            icon={<GiStakeHammer />}
            _hover={{
              bg: 'yellow.500',
              color: useColorModeValue('white', 'gray.700'),
            }}
            isRound
          />
   
      </Stack>
  </Flex>
    
  )
}



const NavItem = ({ label, children, href, icon, ...rest }) => {
  const { isOpen, onToggle } = useDisclosure();
  // console.log('EEEERE aR your childs bitch')
  // console.log(children)
  // console.log(label)
  // console.log(icon)

  return (

    <Stack spacing={0} onClick={children && onToggle}>
    <Flex
      py={2}
      ml={8}
      // as={Link}
      // href={'#'}
      // justify={'space-between'}
      align={'center'}
      textColor='black'
      fontFamily="sidebarFont"

      _hover={{
        textDecoration: 'none',
      }}>

     {icon && (
          <Icon
            mr="4"
            fontSize="16"
            boxSize={{base:'1em', md:'2em'}}
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}

      {/* <Text
        fontWeight={500}
        color={useColorModeValue('black', 'gray.200')}>
        {label}
      </Text> */}
      <Link  py={2}   fontFamily="sidebarFont"
      href={href} key={label}
              >
        {label}
      </Link>

      {children && (
        <Icon
          as={ChevronDownIcon}
          transition={'all .25s ease-in-out'}
          transform={isOpen ? 'rotate(180deg)' : ''}
          w={6}
          h={6}
          ml={2}
          // justifyItems='left'
        />
      )}
    </Flex>

    <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
      <Stack
        pl={20}
        borderLeft={1}
        borderStyle={'solid'}
        textColor='white'
        bgColor={'black'}
        py={4}
        // borderColor={useColorModeValue('green.700', 'gray.700')}
        align={'start'}>
        {children &&
          children.map((child) => (
              <Link  py={2}   fontFamily="sidebarFont"
              href={child.href} key={child.label}
              >
                {child.label}
              </Link>
          ))}
      </Stack>
    </Collapse>
  </Stack>


  )
}

const MobileNav = ({ onOpen, ...rest }) => {
  return (
    <Flex
      ml={{ base: 0, lg: 0 }}
      px={{ base: 4, lg: 10 }}
      mt={5}
      height="20"
      alignItems="center"
      bg={useColorModeValue('yellow.300', 'gray.900')}
      justifyContent="flex-start"
      {...rest}>
      <IconButton
        variant="ghost"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
        size='xl'
        color='black'
        p={6}
        rounded='none'
        // border={'2px'}
        _hover={{
          transform: 'scale(1.15)',
        }}
      />

          {/* <Box ml={'calc(75vh)'}>
            <Image
                src={getCloudinaryImage('nekosero5.png')} 
                alt="Nekosero Brand Logo"
                width={70}
                height= {70}
                priority
                placeholder="blur"
                
                blurDataURL={getCloudinaryImageBlur('nekosero5.png')}
                />
              </Box> */}
    </Flex>

  )
}