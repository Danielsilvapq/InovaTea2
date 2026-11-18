import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccessiblePatient } from "@/lib/auth";
import { updatePreferences } from "@/app/actions/patients";
import { ActionForm } from "@/components/ActionForm";
import { AvatarPicker } from "@/components/AvatarPicker";

export default async function PreferenciasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getAccessiblePatient(id);
  if (!access || !access.isGuardian) notFound();
  const p = access.patient;
  return (
    <div className="stack" style={{ maxWidth: 680, margin: "0 auto" }}>
      <Link href={`/paciente/${id}`}>← Voltar ao perfil</Link>
      <div className="card">
        <h1>Preferências sensoriais · {p.name}</h1>
        <p className="small muted">Ajuste o ambiente do modo criança para o conforto dela.</p>
        <ActionForm action={updatePreferences} submitLabel="Salvar preferências">
          <input type="hidden" name="patientId" value={id} />
          <AvatarPicker defaultValue={p.avatar} />
          <label className="row" style={{ fontWeight: 400 }}>
            <input type="checkbox" name="soundOn" defaultChecked={p.soundOn} style={{ width: 22, minHeight: 22 }} />
            Sons suaves de feedback (desligado por padrão)
          </label>
          <label className="row" style={{ fontWeight: 400, margin: "12px 0" }}>
            <input type="checkbox" name="reduceMotion" defaultChecked={p.reduceMotion} style={{ width: 22, minHeight: 22 }} />
            Reduzir movimentos e animações
          </label>
          <div className="field">
            <label htmlFor="fontScale">Tamanho do texto</label>
            <select id="fontScale" name="fontScale" defaultValue={String(p.fontScale)}>
              <option value="100">Normal</option>
              <option value="115">Grande</option>
              <option value="130">Muito grande</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="interests">Interesses favoritos (o TeaBot usa nas conversas)</label>
            <input id="interests" name="interests" defaultValue={p.interests ?? ""} />
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
