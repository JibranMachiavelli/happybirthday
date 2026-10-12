import { birthday } from '../../config/birthday'

export function Fallback() {
  return (
    <div className="fallback" role="alert">
      <p className="fallback__text">{birthday.fallback.message}</p>
      <button className="btn btn--enter is-in" onClick={() => window.location.reload()}>
        {birthday.fallback.button}
      </button>
    </div>
  )
}
