// Tudo que é pessoal mora aqui. Edite à vontade.

// arquivos em /public (funciona em subpasta, ex.: GitHub Pages)
const asset = (path: string) => import.meta.env.BASE_URL + path

export const birthday = {
  name: 'Nome',
  signature: 'Seu nome',
  title: 'Um lugar feito para você',

  intro: {
    lines: ['Ei...', 'Eu fiz uma coisa pra você.', 'Mas você vai ter que descobrir.'],
    button: 'Entrar ✨',
  },

  guide: {
    title: 'Explore um pouquinho ✨',
    desktop: 'WASD para andar',
    mobile: 'Use o controle para andar',
  },

  prompts: {
    desktop: 'Pressione E',
    mobile: 'Tocar para descobrir',
    portal: 'Tem mais uma coisa...',
    portalLocked: 'Ainda falta descobrir algumas coisas...',
    egg: '?',
  },

  points: {
    flower: {
      message: 'Algumas pessoas simplesmente deixam os lugares mais bonitos quando chegam.',
      button: 'guardar ✨',
    },
    star: {
      message: 'Algumas pessoas aparecem por acaso e acabam virando uma parte muito boa da história.',
      button: 'guardar ✨',
    },
    camera: {
      message: 'Uma memória mora aqui.',
      photo: asset('memories/photo-1.jpg'),
      placeholder: 'coloque uma foto aqui',
      button: 'guardar ✨',
    },
    gift: {
      lines: ['Eu podia simplesmente ter escrito feliz aniversário...', '...mas isso seria fácil demais.'],
      button: 'guardar ✨',
    },
  },

  final: {
    lines: [
      'Parabéns.',
      'Hoje o mundo ficou oficialmente mais velho...',
      '...mas ainda bem que ganhou você nele.',
    ],
    // {name} é substituído pelo nome acima
    headline: 'Feliz aniversário, {name} ❤️',
    letterButton: 'tem uma última coisa 💌',
  },

  letter: {
    paragraphs: [
      'Eu poderia tentar colocar tudo em uma mensagem, mas provavelmente ainda faltaria alguma coisa.',
      'Então fiz esse pequeno lugar.',
      'Para te lembrar que hoje não é só mais um dia.',
      'É o seu dia.',
      'Espero que esse novo ano te traga histórias bonitas, lugares novos, pessoas boas e muitos motivos para sorrir.',
      'Feliz aniversário ❤️',
    ],
    close: 'fechar',
  },

  easterEgg: 'Você realmente foi procurar tudo 😂',

  fallback: {
    message:
      'Eu tinha preparado um pequeno mundo para você, mas seu navegador resolveu estragar a surpresa 😭',
    button: 'Tentar novamente',
  },

  assets: {
    music: asset('audio/background.mp3'),
    musicVolume: 0.25,
    model: asset('models/person.glb'),
  },

  colors: {
    bg: '#080B16',
    bg2: '#11182A',
    warm: '#FFD6A5',
    rose: '#EFB8C8',
    sage: '#98C9A3',
    text: '#F8F7F4',
  },

  // Personagem procedural (ignorado se existir person.glb)
  character: {
    skin: '#f7d9c6',
    hair: '#6a4128',
    eyes: '#3f9a63',
    top: '#f3ead9',
    skirt: '#c9b7a6',
    shoes: '#fbfaf7',
    accent: '#EFB8C8',
  },
}

export const headline = birthday.final.headline.replace('{name}', birthday.name)
