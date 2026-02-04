import React, { useEffect, useRef } from 'react'
import lottie from 'lottie-web'

const LottieWebAnimation = ({
    path,
    width = '100px',
    height = '100px',
    loop = true,
    autoplay = true,
    speed = 1,
    direction = 1,
    className = '',
    style = {},
    renderer = 'svg'
}) => {
    const containerRef = useRef(null)
    const animationRef = useRef(null)

    useEffect(() => {
        if (!containerRef.current || !path) return

        if (animationRef.current) {
            animationRef.current.destroy()
        }

        animationRef.current = lottie.loadAnimation({
            container: containerRef.current,
            renderer: renderer,
            loop: loop,
            autoplay: autoplay,
            animationData: path,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
            }
        })

        if (speed !== 1) {
            animationRef.current.setSpeed(speed)
        }

        if (direction !== 1) {
            animationRef.current.setDirection(direction)
        }

        return () => {
            if (animationRef.current) {
                animationRef.current.destroy()
                animationRef.current = null
            }
        }
    }, [path, loop, autoplay, speed, direction, renderer])

    const play = () => {
        if (animationRef.current) {
            animationRef.current.play()
        }
    }

    const pause = () => {
        if (animationRef.current) {
            animationRef.current.pause()
        }
    }

    const stop = () => {
        if (animationRef.current) {
            animationRef.current.stop()
        }
    }

    const goToAndStop = (frame) => {
        if (animationRef.current) {
            animationRef.current.goToAndStop(frame, true)
        }
    }

    const goToAndPlay = (frame) => {
        if (animationRef.current) {
            animationRef.current.goToAndPlay(frame, true)
        }
    }

    React.useImperativeHandle(React.forwardRef(() => containerRef), () => ({
        play,
        pause,
        stop,
        goToAndStop,
        goToAndPlay,
        animation: animationRef.current
    }))

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                width: width,
                height: height,
                ...style
            }}
        />
    )
}

export default LottieWebAnimation