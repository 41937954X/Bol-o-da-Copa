import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabase';

// ==========================================
// SUBCOMPONENTE: CARD DE JOGO DUPLO (ALTERAÇÃO ATÉ O INÍCIO)
// ==========================================
function CardJogoDuplo({ jogo, participanteId, isAdmin, visaoApenasLeitura, onSalvarPalpite, onSalvarResultadoReal }) {
  const [palpiteCasa, setPalpiteCasa] = useState('');
  const [palpiteFora, setPalpiteFora] = useState('');
  const [realCasa, setRealCasa] = useState(jogo?.placar_casa ?? '');
  const [realFora, setRealFora] = useState(jogo?.placar_fora ?? '');
  const [jaTemPalpite, setJaTemPalpite] = useState(false);

  useEffect(() => {
    const buscarPalpite = async () => {
      if (!participanteId || !jogo?.id) return;
      try {
        const { data } = await supabase
          .from('palpites')
          .select('palpite_casa, palpite_fora')
          .eq('jogo_id', jogo.id)
          .eq('participante_id', participanteId)
          .maybeSingle();

        if (data) {
          setPalpiteCasa(data.palpite_casa ?? '');
          setPalpiteFora(data.palpite_fora ?? '');
          setJaTemPalpite(data.palpite_casa !== null && data.palpite_fora !== null);
        } else {
          setPalpiteCasa('');
          setPalpiteFora('');
          setJaTemPalpite(false);
        }
      } catch (e) {
        console.error(e.message);
      }
    };
    buscarPalpite();
    setRealCasa(jogo?.placar_casa ?? '');
    setRealFora(jogo?.placar_fora ?? '');
  }, [jogo, participanteId]);

  if (!jogo) return null;

  const jogoJaComecou = jogo?.data_hora ? new Date() > new Date(jogo.data_hora) : false;
  const inputsTravados = visaoApenasLeitura || (jogoJaComecou && !isAdmin);

  return (
    <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4 hover:border-slate-700 transition">
      <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
        <span className="bg-slate-800 px-2.5 py-1 rounded-md text-[10px] font-black text-yellow-500 uppercase tracking-wider">
          {jogo.fase && jogo.fase !== 'grupo' ? (jogo.fase === '16avos' ? '16 DE FINAL' : jogo.fase.toUpperCase()) : `Grupo ${jogo.grupo || ''}`} - {jogo.numero_jogo ? `Jogo ${jogo.numero_jogo}` : `Rodada ${jogo.rodada || ''}`}
        </span>
        <span className="text-xs text-slate-400 font-bold">
          🕒 {jogo.data_hora ? new Date(jogo.data_hora).toLocaleDateString([], {day: '2-digit', month: '2-digit'}) : '--/--'} - {jogo.data_hora ? new Date(jogo.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </span>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4">
        {/* Mandante */}
        <div className="flex items-center gap-2 sm:gap-3 justify-end flex-1 text-right min-w-[90px] sm:min-w-0">
          <span className="font-bold text-xs sm:text-sm tracking-wide truncate text-slate-200">
            {jogo.time_casa?.nome || "A definir"}
          </span>
          {jogo.time_casa?.url_escudo ? (
            <img src={jogo.time_casa.url_escudo} alt="" className="w-8 h-5 sm:w-10 sm:h-7 object-cover rounded shadow border border-slate-700 flex-shrink-0" />
          ) : (
            <div className="w-8 h-5 sm:w-10 sm:h-7 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-[10px] text-slate-600 font-bold flex-shrink-0">🏳️</div>
          )}
        </div>

        {/* Placar Real */}
        <div className="flex flex-col items-center gap-1 bg-slate-950/40 p-2 rounded-xl border border-slate-800 min-w-[100px] sm:min-w-[110px] mx-auto sm:mx-0">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Placar Real</span>
          <div className="flex items-center gap-1.5">
            <input 
              type="number" 
              disabled={!isAdmin}
              value={realCasa}
              onChange={(e) => setRealCasa(e.target.value)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-900 border border-slate-700 text-center font-black text-sm sm:text-base text-slate-200 focus:outline-none"
              placeholder="-"
            />
            <span className="text-xs font-black text-slate-600">x</span>
            <input 
              type="number" 
              disabled={!isAdmin}
              value={realFora}
              onChange={(e) => setRealFora(e.target.value)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-900 border border-slate-700 text-center font-black text-sm sm:text-base text-slate-200 focus:outline-none"
              placeholder="-"
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => onSalvarResultadoReal(jogo.id, realCasa, realFora)}
              className="text-[10px] text-green-400 font-bold hover:underline mt-1"
            >
              Atualizar Placar
            </button>
          )}
        </div>

        {/* Visitante */}
        <div className="flex items-center gap-2 sm:gap-3 justify-start flex-1 text-left min-w-[90px] sm:min-w-0">
          {jogo.time_fora?.url_escudo ? (
            <img src={jogo.time_fora.url_escudo} alt="" className="w-8 h-5 sm:w-10 sm:h-7 object-cover rounded shadow border border-slate-700 flex-shrink-0" />
          ) : (
            <div className="w-8 h-5 sm:w-10 sm:h-7 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-[10px] text-slate-600 font-bold flex-shrink-0">🏳️</div>
          )}
          <span className="font-bold text-xs sm:text-sm tracking-wide truncate text-slate-200">
            {jogo.time_fora?.nome || "A definir"}
          </span>
        </div>
      </div>

      {/* FOOTER DO CARD */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
          <span className="text-xs font-bold text-slate-400">Palpite:</span>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 mx-auto sm:mx-0">
            {jogo.time_casa?.url_escudo && <img src={jogo.time_casa.url_escudo} alt="" className="w-5 h-3.5 object-cover rounded-sm border border-slate-700" />}
            <input 
              type="number" 
              disabled={inputsTravados}
              value={palpiteCasa}
              onChange={(e) => setPalpiteCasa(e.target.value)}
              className="w-8 bg-transparent text-center font-bold text-sm text-yellow-400 focus:outline-none disabled:text-slate-500"
              placeholder="-"
            />
            <span className="text-xs text-slate-600 font-bold">x</span>
            <input 
              type="number" 
              disabled={inputsTravados}
              value={palpiteFora}
              onChange={(e) => setPalpiteFora(e.target.value)}
              className="w-8 bg-transparent text-center font-bold text-sm text-yellow-400 focus:outline-none disabled:text-slate-500"
              placeholder="-"
            />
            {jogo.time_fora?.url_escudo && <img src={jogo.time_fora.url_escudo} alt="" className="w-5 h-3.5 object-cover rounded-sm border border-slate-700" />}
          </div>
        </div>

        {!jogoJaComecou && (
          <button
            onClick={() => onSalvarPalpite(jogo.id, palpiteCasa, palpiteFora)}
            disabled={!participanteId}
            className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-950 text-xs font-black rounded-lg transition hover:brightness-110 disabled:opacity-40"
          >
            {jaTemPalpite ? 'Alterar Palpite' : 'Salvar Palpite'}
          </button>
        )}

        {jogoJaComecou && isAdmin && (
          <button
            onClick={() => onSalvarPalpite(jogo.id, palpiteCasa, palpiteFora)}
            className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-lg transition hover:brightness-110"
          >
            Alterar (Admin)
          </button>
        )}

        {jogoJaComecou && !isAdmin && (
          jaTemPalpite ? (
            <span className="text-[11px] text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-lg text-center w-full sm:w-auto">
              ✓ Palpite Registrado
            </span>
          ) : (
            <span className="text-[11px] text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg text-center w-full sm:w-auto">
              🔒 Apostas encerradas
            </span>
          )
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL: APP
// ==========================================
export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loginCelular, setLoginCelular] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [abaAtiva, setAbaAtiva] = useState('visualizacao'); 
  const [faseMataMataAtiva, setFaseMataMataAtiva] = useState('16avos'); 
  const [fasePublicaMataMata, setFasePublicaMataMata] = useState('16avos');
  const [tipoPublicoFiltro, setTipoPublicoFiltro] = useState('grupo');

  const [jogos, setJogos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [palpitesTodos, setPalpitesTodos] = useState([]);
  const [participanteSelecionado, setParticipanteSelecionado] = useState('');
  const [diaSelecionado, setDiaSelecionado] = useState('2026-06-11');
  const [rodadaFiltroRanking, setRodadaFiltroRanking] = useState(1);
  const [novoParticipanteNome, setNovoParticipanteNome] = useState('');
  const [novoParticipanteCelular, setNovoParticipanteCelular] = useState('');
  
  const [participantesInativosPorRodada, setParticipantesInativosPorRodada] = useState({}); 

  const [isAdmin, setIsAdmin] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const PIN_CORRETO = '1542';

  const [adminFiltroTipo, setAdminFiltroTipo] = useState('grupo'); 

  const barraDatasRef = useRef(null);
  const barraDatasPublicaRef = useRef(null);

  const diasCopa = [
    { data: '2026-06-11', label: 'Qui, 11/06' }, { data: '2026-06-12', label: 'Sex, 12/06' },
    { data: '2026-06-13', label: 'Sáb, 13/06' }, { data: '2026-06-14', label: 'Dom, 14/06' },
    { data: '2026-06-15', label: 'Seg, 15/06' }, { data: '2026-06-16', label: 'Ter, 16/06' },
    { data: '2026-06-17', label: 'Qua, 17/06' }, { data: '2026-06-18', label: 'Qui, 18/06' },
    { data: '2026-06-19', label: 'Sex, 19/06' }, { data: '2026-06-20', label: 'Sáb, 20/06' },
    { data: '2026-06-21', label: 'Dom, 21/06' }, { data: '2026-06-22', label: 'Seg, 22/06' },
    { data: '2026-06-23', label: 'Ter, 23/06' }, { data: '2026-06-24', label: 'Qua, 24/06' },
    { data: '2026-06-25', label: 'Qui, 25/06' }, { data: '2026-06-26', label: 'Sex, 26/06' },
    { data: '2026-06-27', label: 'Sáb, 27/06' }
  ];

  const rolarDatasComMouse = (e) => {
    const container = e.currentTarget;
    if (container && e.deltaY !== 0) {
      container.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  const navegarAbasSetas = (direcao, referencia) => {
    const refAlvo = referencia === 'publico' ? barraDatasPublicaRef : barraDatasRef;
    if (refAlvo?.current) {
      const deslocamento = direcao === 'esquerda' ? -200 : 200;
      refAlvo.current.scrollBy({ left: deslocamento, behavior: 'smooth' });
    }
  };

  const buscarDados = async () => {
    try {
      const resJogos = await supabase.from('jogos').select(`
        id, data_hora, grupo, placar_casa, placar_fora, status, rodada, fase, numero_jogo,
        time_casa:selecao_casa_id (nome, url_escudo),
        time_fora:selecao_fora_id (nome, url_escudo)
      `).order('data_hora', { ascending: true });

      const resParticipantes = await supabase.from('participantes').select('*').order('nome');
      const resPalpites = await supabase.from('palpites').select('*');

      if (resJogos.error) throw resJogos.error;
      if (resParticipantes.error) throw resParticipantes.error;
      if (resPalpites.error) throw resPalpites.error;

      setJogos(resJogos.data || []);
      setParticipantes(resParticipantes.data || []);
      setPalpitesTodos(resPalpites.data || []);
    } catch (e) {
      console.error(e.message);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  useEffect(() => {
    if (usuarioLogado?.id) {
      if (!isAdmin) {
        setParticipanteSelecionado(usuarioLogado.id);
      }
    } else {
      setParticipanteSelecionado('');
    }
  }, [usuarioLogado, isAdmin]);

  const lidarLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    setErroLogin('');
    const celularString = loginCelular || '';
    const celularLimpo = celularString.replace(/\D/g, '');

    try {
      const { data, error } = await supabase
        .from('participantes')
        .select('*')
        .eq('celular', celularLimpo)
        .maybeSingle();

      if (error || !data) {
        setErroLogin('Número de celular não cadastrado no bolão.');
        setLoadingLogin(false);
        return;
      }

      if (data.senha !== loginSenha) {
        setErroLogin('Senha incorreta. Verifique e tente novamente.');
        setLoadingLogin(false);
        return;
      }

      setUsuarioLogado(data);
    } catch (err) {
      setErroLogin('Falha ao conectar com o servidor.');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setIsAdmin(false);
    setAbaAtiva('visualizacao');
  };

  const verificarPinAdmin = (e) => {
    e.preventDefault();
    if (inputPin === PIN_CORRETO) {
      setIsAdmin(true);
      setAbaAtiva('painel-admin');
      alert('Acesso de Administrador Ativado!');
    } else { alert('PIN Incorreto!'); setIsAdmin(false); }
  };

  const lidarSalvarPalpite = async (jogoId, placarCasa, placarFora) => {
    try {
      const { error } = await supabase.from('palpites').upsert({
        participante_id: participanteSelecionado,
        jogo_id: jogoId,
        palpite_casa: placarCasa === '' ? null : parseInt(placarCasa),
        palpite_fora: placarFora === '' ? null : parseInt(placarFora)
      }, { onConflict: 'participante_id,jogo_id' });

      if (error) throw error;
      alert('Palpite salvo com sucesso!');
      buscarDados();
    } catch (e) { alert(e.message); }
  };

  const lidarSalvarResultadoReal = async (jogoId, realCasa, realFora) => {
    try {
      const { error } = await supabase.from('jogos').update({
        placar_casa: realCasa === '' ? null : parseInt(realCasa),
        placar_fora: realFora === '' ? null : parseInt(realFora)
      }).eq('id', jogoId);

      if (error) throw error;
      alert('Placar real atualizado com sucesso!');
      buscarDados();
    } catch (e) { alert(e.message); }
  };

  const cadastrarParticipante = async (e) => {
    e.preventDefault();
    if (!novoParticipanteNome?.trim() || !novoParticipanteCelular?.trim()) return;
    const celularLimpo = novoParticipanteCelular.replace(/\D/g, '');
    
    try {
      const { error } = await supabase
        .from('participantes')
        .insert([{ 
          nome: novoParticipanteNome.trim(),
          celular: celularLimpo,
          senha: '123' 
        }]);

      if (error) throw error;
      alert(`Sucesso! ${novoParticipanteNome} pré-cadastrado com a senha inicial "123".`);
      setNovoParticipanteNome('');
      setNovoParticipanteCelular('');
      buscarDados();
    } catch (e) { alert('Erro ao cadastrar: Celular já existente ou falha.'); }
  };

  const alternarParticipacaoAtiva = (pId, rodada) => {
    const apiKey = `${rodada}-${pId}`;
    setParticipantesInativosPorRodada(anterior => ({
      ...anterior,
      [apiKey]: !anterior[apiKey]
    }));
  };

  const calcularRankingPorRodada = () => {
    return (participantes || []).map(p => {
      const chaveInativo = `${rodadaFiltroRanking}-${p.id}`;
      if (participantesInativosPorRodada[chaveInativo]) {
        return { ...p, pontos: 'Suspenso/Inativo', exatos: 0, saldos: 0, tendencias: 0 };
      }

      let pontos = 0;
      let exatos = 0;      
      let saldos = 0;      
      let tendencias = 0;  

      const palpitesDaRodada = (palpitesTodos || []).filter(palp => {
        const jogo = (jogos || []).find(j => j.id === palp.jogo_id);
        return p && palp.participante_id === p.id && jogo && jogo.rodada === parseInt(rodadaFiltroRanking);
      });

      palpitesDaRodada.forEach(palpite => {
        const jogoReal = (jogos || []).find(j => j.id === palpite.jogo_id);
        if (jogoReal && jogoReal.placar_casa !== null && jogoReal.placar_fora !== null) {
          const rC = jogoReal.placar_casa; const rF = jogoReal.placar_fora;
          const pC = palpite.palpite_casa; const pF = palpite.palpite_fora;

          if (pC !== null && pF !== null) {
            const saldoReal = rC - rF;
            const saldoPalpite = pC - pF;

            if (pC === rC && pF === rF) {
              pontos += 4;
              exatos += 1;
            } else if (((rC > rF && pC > pF) || (rC < rF && pC < pF)) && saldoReal === saldoPalpite) {
              pontos += 2;
              saldos += 1;
            } else if ((pC > pF && rC > rF) || (pC < pF && rC < rF) || (pC === pF && rC === rF)) {
              pontos += 1;
              tendencias += 1;
            }
          }
        }
      });
      return { ...p, pontos, exatos, saldos, tendencias };
    }).sort((a, b) => {
      if (a.pontos === 'Suspenso/Inativo') return 1;
      if (b.pontos === 'Suspenso/Inativo') return -1;
      if (b.pontos !== a.pontos) return b.pontos - a.pontos;
      if (b.exatos !== a.exatos) return b.exatos - a.exatos;
      return b.saldos - a.saldos;
    });
  };

  const calcularTabelaGruposCopa = () => {
    const grupos = {};
    const letrasGrupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    letrasGrupos.forEach(l => { grupos[l] = {}; });

    (jogos || []).forEach(jogo => {
      const g = jogo.grupo;
      if (!g || !grupos[g] || ['oitavas','16avos','quartas','semi','final'].includes(jogo.fase)) return;

      if (jogo.time_casa?.nome && !grupos[g][jogo.time_casa.nome]) {
        grupos[g][jogo.time_casa.nome] = { nome: jogo.time_casa.nome, escudo: jogo.time_casa.url_escudo, pts: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 };
      }
      if (jogo.time_fora?.nome && !grupos[g][jogo.time_fora.nome]) {
        grupos[g][jogo.time_fora.nome] = { nome: jogo.time_fora.nome, escudo: jogo.time_fora.url_escudo, pts: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 }; 
      }

      if (jogo.placar_casa !== null && jogo.placar_fora !== null && jogo.time_casa?.nome && jogo.time_fora?.nome) {
        const tc = grupos[g][jogo.time_casa.nome];
        const tf = grupos[g][jogo.time_fora.nome];
        const pc = jogo.placar_casa;
        const pf = jogo.placar_fora;

        if (tc && tf) {
           tc.gp += pc; tc.gc += pf;
           tf.gp += pf; tf.gc += pc;

           if (pc > pf) { tc.pts += 3; tc.v += 1; tf.d += 1; }
           else if (pc < pf) { tf.pts += 3; tf.v += 1; tc.d += 1; }
           else { tc.pts += 1; tf.pts += 1; tc.e += 1; tf.e += 1; }

           tc.sg = tc.gp - tc.gc;
           tf.sg = tf.gp - tf.gc;
        }
      }
    });

    Object.keys(grupos).forEach(g => {
      grupos[g] = Object.values(grupos[g]).sort((a, b) => b.pts - a.pts || b.sg - a.sg);
    });
    return grupos;
  };

  const adminJogosFiltrados = (jogos || []).filter(j => {
    if (!j) return false;
    if (adminFiltroTipo === 'grupo') {
      if (j.fase && j.fase !== 'grupo') return false;
      if (!j.data_hora) return false;
      const d = new Date(j.data_hora);
      const dataFormatada = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return dataFormatada === diaSelecionado;
    } else {
      return j.fase === adminFiltroTipo;
    }
  });

  const juegosFiltrados = (jogos || []).filter(j => {
    if (!j || !j.data_hora) return false;
    if (j.fase && j.fase !== 'grupo') return false;
    const d = new Date(j.data_hora);
    const dataFormatada = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dataFormatada === diaSelecionado;
  });

  const jogosPublicosFiltrados = (jogos || []).filter(j => {
    if (!j) return false;
    if (tipoPublicoFiltro === 'grupo') {
      if (j.fase && j.fase !== 'grupo') return false;
      if (!j.data_hora) return false;
      const d = new Date(j.data_hora);
      const dataFormatada = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return dataFormatada === diaSelecionado;
    } else {
      return j.fase === fasePublicaMataMata;
    }
  });

  const jogosMataMataFiltrados = (jogos || []).filter(j => j && j.fase === faseMataMataAtiva);
  const rankingFiltrado = calcularRankingPorRodada();
  const tabelasCopa = calcularTabelaGruposCopa();

  if (!usuarioLogado) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-center items-center px-4">
        <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-6">
            <span className="text-4xl">🏆</span>
            <h1 className="text-xl font-black bg-gradient-to-r from-yellow-400 to-green-500 bg-clip-text text-transparent mt-2">
              BOLÃO COPA 2026
            </h1>
            <p className="text-slate-400 text-xs mt-1">Insira seus dados cadastrados para entrar</p>
          </div>

          <form onSubmit={lidarLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Celular:</label>
              <input
                type="text"
                placeholder="(12) 99999-9999"
                value={loginCelular}
                onChange={(e) => setLoginCelular(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 focus:outline-none focus:border-yellow-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">Senha:</label>
              <input
                type="password"
                placeholder="••••••"
                value={loginSenha}
                onChange={(e) => setLoginSenha(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 focus:outline-none focus:border-yellow-500"
                required
              />
            </div>

            {erroLogin && (
              <p className="text-xs font-bold text-red-400 text-center bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                ⚠️ {erroLogin}
              </p>
            )}

            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition disabled:opacity-50"
            >
              {loadingLogin ? 'Entrando...' : 'Acessar o Bolão'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!jogos || jogos.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center text-xs font-bold">
        🔄 Carregando tabelas e confrontos do bolão...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased pb-4">
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-50 px-4 py-3 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex items-center justify-between w-full lg:w-auto gap-3">
          <h1 className="text-base sm:text-xl font-black bg-gradient-to-r from-yellow-400 to-green-500 bg-clip-text text-transparent whitespace-nowrap">🏆 BOLÃO COPA 2026</h1>
          <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold border truncate max-w-[150px] sm:max-w-none ${isAdmin ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            {isAdmin ? 'Modo: Admin' : `Olá, ${usuarioLogado?.nome || 'Competidor'}`}
          </span>
        </div>

        <nav className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold overflow-x-auto w-full lg:w-auto whitespace-nowrap scrollbar-none">
          <button onClick={() => { setAbaAtiva('visualizacao'); setAdminFiltroTipo('grupo'); }} className={`px-3 py-1.5 rounded-lg transition ${abaAtiva === 'visualizacao' ? 'bg-yellow-500 text-slate-950' : 'text-slate-400'}`}>
             📝 Meus Palpites
          </button>
          <button onClick={() => setAbaAtiva('palpites-publicos')} className={`px-3 py-1.5 rounded-lg transition ${abaAtiva === 'palpites-publicos' ? 'bg-yellow-500 text-slate-950' : 'text-slate-400'}`}>
             👥 Palpites da Galera
          </button>
          <button onClick={() => setAbaAtiva('mata-mata')} className={`px-3 py-1.5 rounded-lg transition ${abaAtiva === 'mata-mata' ? 'bg-yellow-500 text-slate-950' : 'text-slate-400'}`}>
            🌳 Chaveamento Mata-Mata
          </button>
          {isAdmin && <button onClick={() => setAbaAtiva('painel-admin')} className={`px-3 py-1.5 rounded-lg transition ${abaAtiva === 'painel-admin' ? 'bg-yellow-500 text-slate-950' : 'text-slate-400'}`}>⚙️ Painel Geral</button>}
          <button onClick={() => setAbaAtiva('ranking')} className={`px-3 py-1.5 rounded-lg transition ${abaAtiva === 'ranking' ? 'bg-yellow-500 text-slate-950' : 'text-slate-400'}`}>📊 Ranking Rodada</button>
          <button onClick={() => setAbaAtiva('grupos-copa')} className={`px-3 py-1.5 rounded-lg transition ${abaAtiva === 'grupos-copa' ? 'bg-yellow-500 text-slate-950' : 'text-slate-400'}`}>🏆 Grupos da Copa</button>
        </nav>

        <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-2">
          {!isAdmin && (
            <form onSubmit={verificarPinAdmin} className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
              <input type="password" placeholder="PIN Admin" value={inputPin} onChange={(e) => setInputPin(e.target.value)} className="bg-slate-950 px-2 py-1 text-xs font-bold rounded-md w-20 sm:w-24 text-center focus:outline-none" />
              <button type="submit" className="bg-slate-800 text-[10px] font-bold px-2 py-1 rounded-md hover:bg-slate-700 transition">Acessar</button>
            </form>
          )}
          <button onClick={handleLogout} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 text-[10px] font-black px-3 py-1.5 rounded-xl transition whitespace-nowrap ml-auto sm:ml-0">
            Sair 🚪
          </button>
        </div>
      </header>

      {/* BARRA DE NAVEGAÇÃO DE DATAS PRINCIPAL */}
      {((abaAtiva === 'visualizacao') || (abaAtiva === 'painel-admin' && adminFiltroTipo === 'grupo')) && (
        <div className="bg-slate-950 border-b border-slate-800 py-3 sticky top-[108px] lg:top-[57px] z-40 shadow-sm relative group">
          <button onClick={() => navegarAbasSetas('esquerda', 'pessoal')} className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900/90 hover:bg-slate-800 text-yellow-500 w-8 h-8 rounded-full border border-slate-700 items-center justify-center shadow-lg transition z-50 hidden md:flex">❮</button>
          <div ref={barraDatasRef} onWheel={rolarDatasComMouse} className="max-w-6xl mx-auto px-4 md:px-10 flex gap-2 overflow-x-auto scroll-smooth scrollbar-none">
            {diasCopa.map(d => (
              <button key={d.data} onClick={() => setDiaSelecionado(d.data)} className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${diaSelecionado === d.data ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-950 border-yellow-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}>{d.label}</button>
            ))}
          </div>
          <button onClick={() => navegarAbasSetas('direita', 'pessoal')} className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900/90 hover:bg-slate-800 text-yellow-500 w-8 h-8 rounded-full border border-slate-700 items-center justify-center shadow-lg transition z-50 hidden md:flex">❯</button>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO DE DATAS DA ÁREA PÚBLICA */}
      {abaAtiva === 'palpites-publicos' && tipoPublicoFiltro === 'grupo' && (
        <div className="bg-slate-950 border-b border-slate-800 py-3 sticky top-[108px] lg:top-[57px] z-40 shadow-sm relative group">
          <button onClick={() => navegarAbasSetas('esquerda', 'publico')} className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900/90 hover:bg-slate-800 text-yellow-500 w-8 h-8 rounded-full border border-slate-700 items-center justify-center shadow-lg transition z-50 hidden md:flex">❮</button>
          <div ref={barraDatasPublicaRef} onWheel={rolarDatasComMouse} className="max-w-6xl mx-auto px-4 md:px-10 flex gap-2 overflow-x-auto scroll-smooth scrollbar-none">
            {diasCopa.map(d => (
              <button key={d.data} onClick={() => setDiaSelecionado(d.data)} className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${diaSelecionado === d.data ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-950 border-yellow-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}>{d.label}</button>
            ))}
          </div>
          <button onClick={() => navegarAbasSetas('direita', 'publico')} className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900/90 hover:bg-slate-800 text-yellow-500 w-8 h-8 rounded-full border border-slate-700 items-center justify-center shadow-lg transition z-50 hidden md:flex">❯</button>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">

        {abaAtiva === 'visualizacao' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="w-full lg:col-span-2 space-y-4">
              {juegosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs font-bold">Nenhum jogo regular agendado para este dia.</div>
              ) : (
                juegosFiltrados.map(j => (
                  <CardJogoDuplo 
                    key={j.id} 
                    jogo={j} 
                    participanteId={participanteSelecionado} 
                    isAdmin={false} 
                    visaoApenasLeitura={false}
                    onSalvarPalpite={lidarSalvarPalpite}
                  />
                ))
              )}
            </div>
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit w-full">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">👤 Competidor Ativo</h3>
              <p className="text-sm font-bold text-yellow-400">{usuarioLogado?.nome || ''}</p>
              <p className="text-[11px] text-slate-400 mt-2">Palpites editáveis livremente até o horário do jogo começar.</p>
            </div>
          </div>
        )}

        {/* ABA PÚBLICA DE PALPITES DA GALERA */}
        {abaAtiva === 'palpites-publicos' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-wrap gap-1.5 justify-center sm:justify-start">
              <span className="text-[10px] font-black uppercase text-slate-500 w-full mb-1">Escolha a Fase de Conferência:</span>
              <button onClick={() => setTipoPublicoFiltro('grupo')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${tipoPublicoFiltro === 'grupo' ? 'bg-yellow-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>Fase de Grupos</button>
              <button onClick={() => { setTipoPublicoFiltro('mata-mata'); setFasePublicaMataMata('16avos'); }} className={`px-3 py-1 rounded-md text-xs font-bold transition ${tipoPublicoFiltro === 'mata-mata' && fasePublicaMataMata === '16avos' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}>16 de Final</button>
              <button onClick={() => { setTipoPublicoFiltro('mata-mata'); setFasePublicaMataMata('oitavas'); }} className={`px-3 py-1 rounded-md text-xs font-bold transition ${tipoPublicoFiltro === 'mata-mata' && fasePublicaMataMata === 'oitavas' ? 'bg-green-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Oitavas</button>
              <button onClick={() => { setTipoPublicoFiltro('mata-mata'); setFasePublicaMataMata('quartas'); }} className={`px-3 py-1 rounded-md text-xs font-bold transition ${tipoPublicoFiltro === 'mata-mata' && fasePublicaMataMata === 'quartas' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Quartas</button>
              <button onClick={() => { setTipoPublicoFiltro('mata-mata'); setFasePublicaMataMata('semi'); }} className={`px-3 py-1 rounded-md text-xs font-bold transition ${tipoPublicoFiltro === 'mata-mata' && fasePublicaMataMata === 'semi' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Semi</button>
              <button onClick={() => { setTipoPublicoFiltro('mata-mata'); setFasePublicaMataMata('final'); }} className={`px-3 py-1 rounded-md text-xs font-bold transition ${tipoPublicoFiltro === 'mata-mata' && fasePublicaMataMata === 'final' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Finais</button>
            </div>

            {jogosPublicosFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs font-bold">Nenhum confronto agendado nesta seção para a data/fase selecionada.</div>
            ) : (
              jogosPublicosFiltrados.map(j => {
                const jogoIniciado = j.data_hora ? new Date() > new Date(j.data_hora) : false;
                return (
                  <div key={j.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-4">
                    
                    {/* 💡 REFATORADO: Layout flexível e empilhado adaptado estritamente para Mobile com Placar Real visível e isolado */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      
                      <div className="flex justify-between sm:justify-start items-center w-full sm:w-auto gap-4">
                        <span className="text-yellow-500 uppercase font-black tracking-wider text-[10px] bg-slate-950 px-2 py-1 rounded">
                          {j.fase === 'grupo' ? `Grupo ${j.grupo || ''}` : j.fase === '16avos' ? '16 de Final' : j.fase.toUpperCase()} - Jogo {j.numero_jogo || j.id}
                        </span>
                        
                        {/* Placar real isolado no mobile */}
                        <div className="flex sm:hidden items-center gap-1.5 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">REAL:</span>
                          <span className="font-mono text-sm font-black text-yellow-400">{j.placar_casa ?? '-'}</span>
                          <span className="text-xs text-slate-600 font-bold">x</span>
                          <span className="font-mono text-sm font-black text-yellow-400">{j.placar_fora ?? '-'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center w-full sm:w-auto gap-2 sm:gap-3 text-slate-200 font-black text-xs sm:text-sm">
                        {/* Mandante */}
                        <div className="flex items-center gap-1.5 justify-end flex-1 sm:flex-initial text-right">
                          <span className="truncate max-w-[85px] sm:max-w-none text-slate-200">{j.time_casa?.nome || 'A definir'}</span>
                          {j.time_casa?.url_escudo ? (
                            <img src={j.time_casa.url_escudo} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm border border-slate-700 flex-shrink-0" />
                          ) : (
                            <span className="text-xs">🏳️</span>
                          )}
                        </div>

                        {/* Placar Real em Desktop */}
                        <span className="hidden sm:inline-block mx-1 bg-slate-950 px-2 py-0.5 rounded text-yellow-400 font-mono font-black border border-slate-800">
                          {j.placar_casa ?? '-'} x {j.placar_fora ?? '-'}
                        </span>

                        {/* Visitante */}
                        <div className="flex items-center gap-1.5 justify-start flex-1 sm:flex-initial text-left">
                          {j.time_fora?.url_escudo ? (
                            <img src={j.time_fora.url_escudo} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm border border-slate-700 flex-shrink-0" />
                          ) : (
                            <span className="text-xs">🏳️</span>
                          )}
                          <span className="truncate max-w-[85px] sm:max-w-none text-slate-200">{j.time_fora?.nome || 'A definir'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900/80 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-800">
                            <th className="py-2.5 px-4">Participante (Ordem Alfabética)</th>
                            <th className="py-2.5 px-4 text-center w-32 sm:w-36">Palpite Registrado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/60 font-medium">
                          {(participantes || []).map(p => {
                            {/* 💡 SOLUCIONADO EM ESCALA ABSOLUTA: Varredura limpa e sem colisão de escopos */}
                            const palpiteReal = (palpitesTodos || []).find(palp => 
                              palp && palp.jogo_id === j.id && p && palp.participante_id === p.id
                            );
                            return (
                              <tr key={p.id} className="hover:bg-slate-900/30 transition">
                                <td className="py-2.5 px-4 text-slate-300 font-bold">{p.nome}</td>
                                <td className="py-2.5 px-4 text-center">
                                  {!palpiteReal ? (
                                    <span className="text-slate-600 font-mono italic">Sem palpite</span>
                                  ) : (
                                    jogoIniciado ? (
                                      <span className="font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-yellow-400 font-black text-sm">
                                        {palpiteReal.palpite_casa} x {palpiteReal.palpite_fora}
                                      </span>
                                    ) : (
                                      <span className="text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md text-[10px]">🔒 Oculto até começar</span>
                                    )
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {abaAtiva === 'mata-mata' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 justify-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <button onClick={() => setFaseMataMataAtiva('16avos')} className={`px-4 py-2 rounded-xl text-xs font-black border transition ${faseMataMataAtiva === '16avos' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>16 de Final</button>
              <button onClick={() => setFaseMataMataAtiva('oitavas')} className={`px-4 py-2 rounded-xl text-xs font-black border transition ${faseMataMataAtiva === 'oitavas' ? 'bg-green-600 border-green-400 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>Oitavas</button>
              <button onClick={() => setFaseMataMataAtiva('quartas')} className={`px-4 py-2 rounded-xl text-xs font-black border transition ${faseMataMataAtiva === 'quartas' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 text-slate-400'}`}>Quartas</button>
              <button onClick={() => setFaseMataMataAtiva('semi')} className={`px-4 py-2 rounded-xl text-xs font-black border transition ${faseMataMataAtiva === 'semi' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Semifinais</button>
              <button onClick={() => setFaseMataMataAtiva('final')} className={`px-4 py-2 rounded-xl text-xs font-black border transition ${faseMataMataAtiva === 'final' ? 'bg-amber-500 border-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>Finais</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {jogosMataMataFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs font-bold col-span-2">Nenhum jogo de mata-mata cadastrado na fase selecionada.</div>
              ) : (
                jogosMataMataFiltrados.map(j => (
                  <CardJogoDuplo 
                    key={j.id} 
                    jogo={j} 
                    participanteId={participanteSelecionado} 
                    isAdmin={isAdmin} 
                    visaoApenasLeitura={false}
                    onSalvarPalpite={lidarSalvarPalpite}
                    onSalvarResultadoReal={lidarSalvarResultadoReal}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'painel-admin' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="w-full lg:col-span-2 space-y-4">
               <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  <span className="text-[10px] font-black uppercase text-slate-500 w-full mb-1">Filtro Geral Admin:</span>
                  <button onClick={() => setAdminFiltroTipo('grupo')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminFiltroTipo === 'grupo' ? 'bg-yellow-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>Fase de Grupos</button>
                  <button onClick={() => setAdminFiltroTipo('16avos')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminFiltroTipo === '16avos' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}>16 de Final</button>
                  <button onClick={() => setAdminFiltroTipo('oitavas')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminFiltroTipo === 'oitavas' ? 'bg-green-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Oitavas</button>
                  <button onClick={() => setAdminFiltroTipo('quartas')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminFiltroTipo === 'quartas' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Quartas</button>
                  <button onClick={() => setAdminFiltroTipo('semi')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminFiltroTipo === 'semi' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Semi</button>
                  <button onClick={() => setAdminFiltroTipo('final')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminFiltroTipo === 'final' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Finais</button>
               </div>

              {adminJogosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs font-bold">Nenhum jogo encontrado com o filtro selecionado.</div>
              ) : (
                adminJogosFiltrados.map(j => <CardJogoDuplo key={j.id} jogo={j} participanteId={participanteSelecionado} isAdmin={true} visaoApenasLeitura={false} onSalvarPalpite={lidarSalvarPalpite} onSalvarResultadoReal={lidarSalvarResultadoReal} />)
              )}
            </div>
            
            <div className="space-y-4 w-full">
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-2">👤 Modificar Palpites de:</h3>
                <select value={participanteSelecionado} onChange={(e) => setParticipanteSelecionado(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 focus:outline-none">
                  {(participantes || []).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-2">🚫 Bloquear na Rodada Atual</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {participantes.map(p => {
                    const jogoExemplo = adminJogosFiltrados[0];
                    const rodadaAtual = jogoExemplo ? jogoExemplo.rodada : 1;
                    const apiKey = `${rodadaAtual}-${p.id}`;
                    const estaSuspenso = participantesInativosPorRodada[apiKey];
                    return (
                      <label key={p.id} className="flex items-center justify-between text-xs font-bold p-1 hover:bg-slate-900 rounded cursor-pointer">
                        <span className={estaSuspenso ? 'text-red-400 line-through' : 'text-slate-300'}>{p.nome}</span>
                        <input type="checkbox" checked={!!estaSuspenso} onChange={() => alternarParticipacaoAtiva(p.id, rodadaAtual)} className="accent-red-500 cursor-pointer" />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-2">➕ Cadastrar Competidor</h3>
                <form onSubmit={cadastrarParticipante} className="space-y-2">
                  <input type="text" placeholder="Nome" value={novoParticipanteNome} onChange={(e) => setNovoParticipanteNome(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-200 focus:outline-none" required />
                  <input type="text" placeholder="Celular" value={novoParticipanteCelular} onChange={(e) => setNovoParticipanteCelular(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-200 focus:outline-none" required />
                  <button type="submit" className="w-full bg-green-500 text-slate-950 font-black py-2 rounded-xl text-xs hover:brightness-110 shadow-md transition">Adicionar no Banco</button>
                </form>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-2">🔑 Contas e Senhas</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto text-[11px] font-mono bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {participantes.map(p => (
                    <div key={p.id} className="border-b border-slate-900 pb-1 text-slate-300">
                      <p className="font-bold text-yellow-500">{p.nome}</p>
                      <p>📱 Tel: {p.celular || 'Sem número'}</p>
                      <p>🔑 Pass: {p.senha}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'ranking' && (
          <div className="max-w-2xl mx-auto space-y-4 w-full">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-slate-950 border border-slate-800 p-4 rounded-xl shadow">
              <h2 className="text-xs sm:text-sm font-black uppercase text-slate-300">📊 Filtrar Tabela:</h2>
              <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
                {[1, 2, 3].map(r => (
                  <button key={r} onClick={() => setRodadaFiltroRanking(r)} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${rodadaFiltroRanking === r ? 'bg-yellow-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>Rodada {r}</button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl w-full">
              <table className="w-full text-left min-w-[480px]">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs font-black uppercase tracking-wider border-b border-slate-800">
                    <th className="py-4 px-4 sm:px-6 text-center w-16">Pos</th>
                    <th className="py-4 px-4 sm:px-6">Participante</th>
                    <th className="py-4 px-4 sm:px-6 text-center w-36">Pontos Obtidos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-xs sm:text-sm font-bold">
                  {rankingFiltrado.map((p, idx) => (
                    <tr key={p.id} className={`hover:bg-slate-900/30 transition ${usuarioLogado?.id === p.id ? 'bg-yellow-500/5' : ''}`}>
                      <td className="py-4 px-4 sm:px-6 text-center">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`}</td>
                      <td className="py-4 px-4 sm:px-6 text-slate-200">{p.nome} {usuarioLogado?.id === p.id && '(Você) ⭐'}</td>
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs ${p.pontos === 'Suspenso/Inativo' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                          {typeof p.pontos === 'number' ? `${p.pontos} pts` : p.pontos}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {abaAtiva === 'grupos-copa' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(tabelasCopa || {}).map(letra => (
              <div key={letra} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg w-full">
                <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2.5 flex justify-between items-center">
                  <h3 className="font-black text-sm text-yellow-500">GRUPO {letra}</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PTS | SG | GP</span>
                </div>
                <div className="p-2 space-y-1.5">
                  {(tabelasCopa[letra] || []).map((time, idx) => (
                    <div key={time.nome} className="flex items-center justify-between text-xs font-bold px-2 py-1.5 hover:bg-slate-900/40 rounded transition">
                      <div className="flex items-center gap-2 truncate mr-2">
                        <span className="text-[10px] font-mono text-slate-500 w-3">{idx + 1}</span>
                        {time.escudo && <img src={time.escudo} alt="" className="w-6 h-4 object-cover rounded shadow-sm border border-slate-800 flex-shrink-0" />}
                        <span className="text-slate-200 truncate">{time.nome}</span>
                      </div>
                      <div className="flex gap-3 font-mono text-slate-300 flex-shrink-0">
                        <span className="font-black text-slate-100 w-4 text-right">{time.pts}</span>
                        <span className="w-5 text-right">{time.sg > 0 ? `+${time.sg}` : time.sg}</span>
                        <span className="w-4 text-right text-slate-500">{time.gp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🎁 SEÇÃO: Premiação */}
        <hr className="border-slate-800/80 my-10" />
        
        <div className="max-w-4xl mx-auto bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl mb-6">
          <div className="text-center mb-6">
            <span className="text-3xl">🎁</span>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mt-1">
              Premiação dos Nossos Patrocinadores
            </h2>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-0.5">Disputa pelas melhores posições!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center hover:border-slate-700 transition">
              <span className="text-2xl mb-1">🍟</span>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wide">Porção batata do Zé</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Garantia de resenha com a melhor porção da rodada.</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center hover:border-slate-700 transition">
              <span className="text-2xl mb-1">🍔</span>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wide">Lanche do Tonhão</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Aquele lanche bruto e de respeito para comemorar.</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center hover:border-slate-700 transition">
              <span className="text-2xl mb-1">🍹</span>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wide">Brinde da Adega do Negão</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Para brindar a vitória com style e bebida trincando.</p>
            </div>
          </div>
        </div>

        {/* ⚖️ SEÇÃO: Regras de Pontuação */}
        <div className="max-w-4xl mx-auto bg-slate-950/20 border border-slate-800/40 rounded-3xl p-5 sm:p-6 text-slate-400 text-xs shadow-inner">
          <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-1.5 justify-center sm:justify-start">
            <span>⚖️</span> Regras de Pontuação & Desempate
          </h4>
          
          <div className="space-y-3 pl-1 text-slate-300">
            <div>
              <span className="text-yellow-500 font-black">🔥 Placar Exato (4 pontos):</span> 
              <span> Quando você acerta os gols exatos de ambas as equipes (ex: Palpite 2x1, Jogo 2x1).</span>
            </div>
            <div>
              <span className="text-yellow-500 font-black">⚽ Vencedor e Saldo de Gols (2 pontos):</span> 
              <span> Acertar o vencedor da partida e a diferença exata de gols, mas errando o placar.</span>
            </div>
            <div>
              <span className="text-yellow-500 font-black">🎯 Apenas o Vencedor ou Empate (1 ponto):</span> 
              <span> Acertar quem ganha (ou empate), mas errando o placar e o saldo de gols.</span>
            </div>
          </div>

          <p className="my-3 border-t border-slate-800/60 pt-3 text-slate-500 font-medium">
            <b>Hierarquia de Desempate:</b> Havendo igualdade na pontuação total da rodada, as posições serão definidas automaticamente seguindo a ordem: 1º Placares Exatos (4 pts) ➡️ 2º Acertos de Vencedor e Saldo (2 pts).
          </p>
        </div>

      </main>
    </div>
  );
}