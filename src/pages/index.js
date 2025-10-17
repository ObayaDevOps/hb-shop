import Head from 'next/head'
import { Box, Flex, Heading, Text, Button, Stack, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

const floatingShapes = [
  { size: '320px', top: '-140px', left: '-120px', opacity: 0.25, delay: 0, duration: 26 },
  { size: '220px', bottom: '10%', right: '12%', opacity: 0.2, delay: 1.2, duration: 18 },
  { size: '180px', top: '18%', right: '-60px', opacity: 0.18, delay: 0.8, duration: 22 },
  { size: '140px', bottom: '12%', left: '8%', opacity: 0.28, delay: 1.6, duration: 16 },
]

const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionBox = motion(Box)

export default function ComingSoon() {
  return (
    <>
      <Head>
        <title>Humble Beeing Shop · Coming Soon</title>
        <meta name="description" content="Humble Beeing Shop is getting ready to open its hive. Buzz back soon!" />
      </Head>

      <Box
        position="relative"
        minH="100vh"
        overflow="hidden"
        bgGradient="radial(circle at 20% 20%, #fff3b0, #ffd166 45%, #f48c06 78%, #fb8500 120%)"
        color="gray.900"
      >
        <Box
          position="absolute"
          inset="0"
          bgGradient="linear(to-br, rgba(255,255,255,0.65), rgba(255,255,255,0.08))"
          mixBlendMode="screen"
        />

        {floatingShapes.map((shape, index) => (
          <motion.div
            key={index}
            initial={{ y: 0, rotate: 0, scale: 0.95 }}
            animate={{ y: [0, -20, 12, 0], rotate: [0, 8, -4, 0], scale: [0.95, 1.03, 0.98, 0.95] }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: shape.top,
              left: shape.left,
              right: shape.right,
              bottom: shape.bottom,
            }}
          >
            <Box
              w={shape.size}
              h={shape.size}
              bgGradient="linear(135deg, rgba(255, 224, 138, 0.7), rgba(240, 140, 0, 0.65))"
              borderRadius="3xl"
              filter="blur(12px)"
              transform="rotate(18deg)"
            />
          </motion.div>
        ))}

        <Flex
          position="relative"
          zIndex="1"
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          px={{ base: 6, md: 10 }}
          py={{ base: 20, md: 28 }}
          minH="100vh"
        >
          <MotionBox
            display="inline-flex"
            alignItems="center"
            gap={3}
            px={5}
            py={2}
            mb={8}
            borderRadius="full"
            bg="rgba(255, 255, 255, 0.25)"
            boxShadow="lg"
            border="1px solid rgba(255, 255, 255, 0.35)"
            backdropFilter="blur(14px)"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Icon as={Sparkles} boxSize={5} color="orange.500" />
            <Text fontFamily="nbText" fontWeight="medium" letterSpacing="wide" textTransform="uppercase" fontSize="sm">
              Uganda&apos;s finest honey
            </Text>
          </MotionBox>

          <MotionHeading
            fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
            fontWeight="900"
            letterSpacing="-0.04em"
            maxW="3xl"
            lineHeight="1.1"
            fontFamily="nbHeading"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            Humble Beeing Shop
            <Box as="span" display="block" fontWeight="extrabold" color="orange.700">
              coming soon
            </Box>
          </MotionHeading>

          <MotionText
            mt={4}
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight="600"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color="gray.700"
            fontFamily="nbHeading"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            The buzz is building
          </MotionText>

          <MotionText
            maxW="2xl"
            mt={8}
            fontSize={{ base: 'lg', md: 'xl' }}
            color="gray.700"
            fontFamily="nbText"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            We&apos;re busy crafting a hive of handcrafted goods, golden flavors, and feel-good rituals to brighten
            your day.
          </MotionText>

          <Stack
            direction={{ base: 'column', sm: 'row' }}
            spacing={6}
            mt={14}
            align="center"
            justify="center"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Button
                as="a"
                href="https://humble-beeing.com"
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                px={10}
                py={7}
                borderRadius="full"
                variant="ghost"
                color="gray.800"
                border="2px solid rgba(0,0,0,0.18)"
                bg="rgba(255, 255, 255, 0.75)"
              >
                Back to main site
              </Button>
            </motion.div>
          </Stack>

        </Flex>
      </Box>
    </>
  )
}
