export const formatTime = seconds => {
  if (seconds === Infinity) return '--'
  return (
    ('0' + Math.floor(seconds / 60)).slice(-2) + ':' + ('0' + Math.floor(seconds % 60)).slice(-2)
  )
}

export const buttons = [
  {
    ref: 'PlayPause',
    icon: 'play',
    action: '$playPause',
  },
  {
    icon: 'stop',
    action: '$stop',
  },
  {
    label: '|<',
    action: '$previous',
  },
  {
    label: '>|',
    action: '$next',
  },
  {
    icon: 'rewind',
    action: '$rewind',
  },
  {
    icon: 'ffwd',
    action: '$forward',
  },
  {
    ref: 'Mute',
    icon: 'unmuted',
    action: '$toggleMute',
  },
  {
    ref: 'Loop',
    icon: 'unloop',
    action: '$toggleLoop',
  },
  {
    ref: 'Resize',
    icon: 'shrink',
    action: '$toggleResize',
  },
  {
    icon: 'reload',
    action: '$reload',
  },
  {
    ref: 'Visible',
    icon: 'visible',
    action: '$showHide',
  },
]

export const videos = [
  'http://video.metrological.com/surfing.mp4'
]
