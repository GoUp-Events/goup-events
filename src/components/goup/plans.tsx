import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Sparkles, ArrowRight, X } from "lucide-react";
import { api } from "@/lib/api";
import { Kicker, Loading, ErrorState, Empty } from "./common";
import { Button } from "@/components/ui/button";
export function PlansPage() {
  const plans = useQuery({ queryKey: ["plans"], queryFn: api.plans, retry: false });
  const [modal, setModal] = useState(false);
  const free = plans.data?.find((p) => !p.premium);
  const premium = plans.data?.find((p) => p.premium);
  return (
    <div className="page wrap">
      <div className="text-center page-intro">
        <Kicker>MAIS POSSIBILIDADES PARA VOCÊ</Kicker>
        <h1>
          Seu jeito de <span className="text-primary">descobrir.</span>
        </h1>
        <p className="section-desc">Comece a explorar. Ou vá além com o GoUp Premium.</p>
      </div>
      {plans.isPending ? (
        <Loading count={2} />
      ) : plans.isError ? (
        <ErrorState error={plans.error} retry={() => void plans.refetch()} />
      ) : !plans.data.length ? (
        <Empty title="Os planos estarão disponíveis em breve" />
      ) : (
        <>
          <div className="plans-grid">
            {plans.data.map((plan) => (
              <article key={plan.name} className={`plan ${plan.premium ? "premium" : ""}`}>
                {plan.premium && <span className="plan-badge">MAIS COMPLETO</span>}
                <h2>GoUp {plan.name}</h2>
                <div className="plan-price">
                  {plan.premium ? "R$ 9,90" : "Gratuito"}
                  {plan.premium && <small> /mês</small>}
                </div>
                <ul>
                  {plan.benefits.map((benefit) => (
                    <li key={benefit}>
                      <Check size={17} />
                      {benefit}
                    </li>
                  ))}
                  <li>
                    <Check size={17} />
                    Até {plan.nearbyLimit} lugares próximos
                  </li>
                </ul>
                {plan.premium ? (
                  <Button className="w-full" onClick={() => setModal(true)}>
                    <Sparkles />
                    Assinar Premium <ArrowRight />
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/eventos">
                      Começar a descobrir <ArrowRight />
                    </Link>
                  </Button>
                )}
              </article>
            ))}
          </div>
          {free && premium && (
            <table className="comparison">
              <thead>
                <tr>
                  <th>Suas possibilidades</th>
                  <th>{free.name}</th>
                  <th>{premium.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Lugares próximos por evento</td>
                  <td>Até {free.nearbyLimit}</td>
                  <td>Até {premium.nearbyLimit}</td>
                </tr>
                {[...new Set([...free.benefits, ...premium.benefits])].map((benefit) => (
                  <tr key={benefit}>
                    <td>{benefit}</td>
                    <td>{free.benefits.includes(benefit) ? "✓" : "—"}</td>
                    <td>{premium.benefits.includes(benefit) ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between">
              <Kicker>GOUP PREMIUM</Kicker>
              <Button
                size="icon"
                variant="ghost"
                autoFocus
                aria-label="Fechar"
                onClick={() => setModal(false)}
              >
                <X />
              </Button>
            </div>
            <h2 id="premium-modal-title">
              Uma prévia das <span className="text-primary">possibilidades.</span>
            </h2>
            <p>
              O pagamento é demonstrativo. Nenhum valor será cobrado e seu plano não será alterado.
            </p>
            <Button className="w-full" onClick={() => setModal(false)}>
              Entendi <Check />
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}
