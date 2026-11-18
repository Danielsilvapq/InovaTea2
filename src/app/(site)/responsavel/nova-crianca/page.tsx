import { requireUser } from "@/lib/auth";
import { createPatient } from "@/app/actions/patients";
import { ActionForm } from "@/components/ActionForm";
import { AvatarPicker } from "@/components/AvatarPicker";
import { CommunicationFields } from "@/components/CommunicationFields";

export default async function NovaCrianca() {
  await requireUser("GUARDIAN");
  return (
    <div className="card" style={{ maxWidth: 680, margin: "0 auto" }}>
      <h1>Cadastrar criança ou adolescente</h1>
      <p className="muted small">
        Essas informações ajudam a adaptar as atividades. Só você e os profissionais que você
        autorizar terão acesso.
      </p>
      <ActionForm action={createPatient} submitLabel="Cadastrar">
        <div className="field">
          <label htmlFor="name">Nome ou apelido</label>
          <input id="name" name="name" required />
        </div>
        <div className="field">
          <label htmlFor="birthDate">Data de nascimento</label>
          <input id="birthDate" name="birthDate" type="date" required />
        </div>
        <CommunicationFields withSupportLevel />
        <AvatarPicker />
        <div className="field">
          <label htmlFor="interests">
            Interesses favoritos <span className="hint">(ex.: dinossauros, trens, planetas)</span>
          </label>
          <input id="interests" name="interests" />
        </div>
        <div className="field">
          <label htmlFor="notes">
            Observações importantes <span className="hint">(sensibilidades, o que acalma, o que incomoda)</span>
          </label>
          <textarea id="notes" name="notes" />
        </div>
      </ActionForm>
    </div>
  );
}
