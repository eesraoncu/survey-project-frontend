import { useParams } from 'react-router-dom'

function FormResponse() {
  const { id } = useParams()
  return (
    <section>
      <h2>Form Yanıtla</h2>
      <p>Form ID: {id}</p>
      <p>Form görüntüleme/yanıtlama arayüzü burada olacak.</p>
    </section>
  )
}

export default FormResponse


