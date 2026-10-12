// Tudo que é pessoal mora aqui. Edite à vontade.

// arquivos em /public (funciona em subpasta, ex.: GitHub Pages)
const asset = (path: string) => import.meta.env.BASE_URL + path

export const birthday = {
  name: 'Rafa',
  signature: 'Jibran',
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
      message: 'Essa flor tá aqui só pra desejar que seu novo ano seja leve e cheio de coisas boas.',
      button: 'guardar ✨',
    },
    star: {
      message: 'Um desejo de aniversário: que esse ano te surpreenda, do jeito bom.',
      button: 'guardar ✨',
    },
    book: {
      message: 'Capítulo novo começando. Que venham histórias boas, risadas e algumas aventuras pelo caminho.',
      button: 'guardar ✨',
    },
    gift: {
      lines: [
        'Eu podia simplesmente ter mandado um "feliz aniversário" no WhatsApp...',
        '...mas achei que valia fazer algo um pouco mais criativo.',
      ],
      button: 'guardar ✨',
    },
  },

  final: {
    lines: [
      'Parabéns!',
      'Mais um ano de histórias pra conta...',
      '...e que esse venha cheio das boas.',
    ],
    // {name} é substituído pelo nome acima
    headline: 'Feliz aniversário, {name}! 🎉',
    letterButton: 'tem um bilhete pra você ✉️',
  },

  letter: {
    paragraphs: [
      '{name},',
      'A gente ainda tá se conhecendo, mas deu vontade de fazer algo diferente de só mandar um parabéns.',
      'Então montei esse pequeno lugar pra te desejar um dia leve, divertido e com gente boa por perto.',
      'Que esse novo ano venha com muitas risadas, lugares novos e boas surpresas.',
      'Feliz aniversário! 🎉',
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

const withName = (text: string) => text.replace('{name}', birthday.name)
export const headline = withName(birthday.final.headline)
export const letterParagraphs = birthday.letter.paragraphs.map(withName)
