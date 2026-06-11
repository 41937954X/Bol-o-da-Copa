import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// ==========================================
// SUBCOMPONENTE: CARD DE JOGO DUPLO (TRAVA DE HORÁRIO COMPLETA)
// ==========================================
function CardJogoDuplo({ jogo, participanteId, isAdmin, visaoApenasLeitura, onSalvarPalpite, onSalvarResultadoReal }) {
  const [palpiteCasa, setPalpiteCasa] = useState('');
  const [palpiteFora, setPalpiteFora] = useState('');
  const [realCasa, setRealCasa] = useState(jogo.placar_casa ?? '');
  const [realFora, setRealFora] = useState(jogo.placar_fora ?? '');
  const [jaTemPalpite, setJaTemPalpite] = useState(false);

  useEffect(() => {
    const buscarPalpite = async () => {
      if (!participanteId) return;
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
    setRealCasa(jogo.placar_casa ?? '');
    setRealFora(jogo.placar_fora ?? '');
  }, [jogo, participanteId]);

  // Trava de horário em tempo real
  const jogoJaComecou = new Date() > new Date(jogo.data_hora);

  // Bloqueia se for leitura, se já salvou palpite ou se o tempo expirou (Admin ignora)
  const inputsTravados = visaoApenasLeitura || (jaTemPalpite && !isAdmin) || (jogoJaComecou && !isAdmin);

  return (
    <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4 hover:border-slate-700 transition">
      <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
        <span className="bg-slate-800 px-2.5 py-1 rounded-md text-[10px] font-black text-yellow-500 uppercase tracking-wider">
          {jogo.fase && jogo.fase !== 'grupo' ? (jogo.fase === '16avos' ? '16 DE FINAL' : jogo.fase.toUpperCase()) : `Grupo ${jogo.grupo}`} - {jogo.numero_jogo ? `Jogo ${jogo.numero_jogo}` : `Rodada ${jogo.rodada}`}
        </span>
        <span className="text-xs text-slate-400 font-bold">
          🕒 {new Date(jogo.data_hora).toLocaleDateString([], {day: '2-digit', month: '2-digit'})} - {new Date(jogo.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4">
        {/* Mandante (Seguro contra nulos) */}
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

        {/* CONTROLE DO PLACAR REAL */}
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

        {/* Visitante (Seguro contra nulos) */}
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

      {/* FOOTER DO CARD: PALPITE */}
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

        {jogoJaComecou && !jaTemPalpite && !isAdmin && (
          <span className="text-[11px] text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg text-center w-full sm:w-auto">
            🔒 Apostas encerradas
          </span>
        )}

        {((!inputsTravados && !jogoJaComecou) || isAdmin) && (
          <button
            onClick={() => onSalvarPalpite(jogo.id, palpiteCasa, palpiteFora)}
            disabled={!participanteId}
            className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-950 text-xs font-black rounded-lg transition hover:brightness-110 disabled:opacity-40"
          >
            {jaTemPalpite && isAdmin ? 'Alterar (Admin)' : 'Salvar Palpite'}
          </button>
        )}

        {jaTemPalpite && !isAdmin && (
          <span className="text-[11px] text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-lg text-center w-full sm:w-auto">
            ✓ Palpite Registrado
          </span>
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
  const [faseMataMataAtiva, setFaseMataMataAtiva] = useState('16avos'); // 💡 Iniciando corretamente em '16avos'
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
    if (e.deltaY !== 0) {
      container.scrollLeft += e.deltaY;
      e.preventDefault();
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
    if (usuarioLogado) {
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

    const celularLimpo = loginCelular.replace(/\D/g, '');

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
      alert('Placar real updated!');
      buscarDados();
    } catch (e) { alert(e.message); }
  };

  const cadastrarParticipante = async (e) => {
    e.preventDefault();
    if (!novoParticipanteNome.trim() || !novoParticipanteCelular.trim()) return;
    
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
    const chave = `${rodada}-${pId}`;
    setParticipantesInativosPorRodada(anterior => ({
      ...anterior,
      [chave]: !anterior[chave]
    }));
  };

  const calcularRankingPorRodada = () => {
    return participantes.map(p => {
      const chaveInativo = `${rodadaFiltroRanking}-${p.id}`;
      if (participantesInativosPorRodada[chaveInativo]) {
        return { ...p, pontos: 'Suspenso/Inativo' };
      }

      let pontos = 0;
      const palpitesDaRodada = palpitesTodos.filter(palp => {
        const jogo = jogos.find(j => j.id === palp.jogo_id);
        return palp.participante_id === p.id && jogo && jogo.rodada === parseInt(rodadaFiltroRanking);
      });

      palpitesDaRodada.forEach(palpite => {
        const jogoReal = jogos.find(j => j.id === palpite.jogo_id);
        if (jogoReal && jogoReal.placar_casa !== null && jogoReal.placar_fora !== null) {
          const rC = jogoReal.placar_casa; const rF = jogoReal.placar_fora;
          const pC = palpite.palpite_casa; const pF = palpite.palpite_fora;

          if (pC !== null && pF !== null) {
            if (pC === rC && pF === rF) pontos += 3;
            else if ((pC > pF && rC > rF) || (pC < pF && rC < rF) || (pC === pF && rC === rF)) pontos += 1;
          }
        }
      });
      return { ...p, pontos };
    }).sort((a, b) => {
      if (a.pontos === 'Suspenso/Inativo') return 1;
      if (b.pontos === 'Suspenso/Inativo') return -1;
      return b.pontos - a.pontos;
    });
  };

  const calcularTabelaGruposCopa = () => {
    const grupos = {};
    const letrasGrupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    letrasGrupos.forEach(l => { grupos[l] = {}; });

    jogos.forEach(jogo => {
      const g = jogo.grupo;
      if (!grupos[g] || !jogo.grupo || jogo.fase === 'oitavas' || jogo.fase === '16avos' || jogo.fase === 'quartas' || jogo.fase === 'semi' || jogo.fase === 'final') return;

      if (jogo.time_casa && !grupos[g][jogo.time_casa.nome]) {
        grupos[g][jogo.time_casa.nome] = { nome: jogo.time_casa.nome, escudo: jogo.time_casa.url_escudo, pts: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 };
      }
      if (jogo.time_fora && !grupos[g][jogo.time_fora.nome]) {
        grupos[g][jogo.time_fora.nome] = { nome: jogo.time_fora.nome, escudo: jogo.time_fora.url_escudo, pts: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 }; 
      }

      if (jogo.placar_casa !== null && jogo.placar_fora !== null) {
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

  const verificarPinAdmin = (e) => {
    e.preventDefault();
    if (inputPin === PIN_CORRETO) {
      setIsAdmin(true);
      setAbaAtiva('painel-admin');
      alert('Acesso de Administrador Ativado!');
    } else { alert('PIN Incorreto!'); setIsAdmin(false); }
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setIsAdmin(false);
    setAbaAtiva('visualizacao');
    setLoginCelular('');
    setLoginSenha('');
  };

  const jogosFiltrados = jogos.filter(j => {
    if (j.fase && j.fase !== 'grupo') return false;
    const d = new Date(j.data_hora);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === diaSelecionado;
  });

  const jogosMataMataFiltrados = jogos.filter(j => j.fase === faseMataMataAtiva);

  const rankingFiltrado = calcularRankingPorRodada();
  const tabelasCopa = calcularTabelaGruposCopa();

  // --- RENDEREZAÇÃO DA TELA DE LOGIN ---
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased pb-12">
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-50 px-4 py-3 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex items-center justify-between w-full lg:w-auto gap-3">
          <h1 className="text-base sm:text-xl font-black bg-gradient-to-r from-yellow-400 to-green-500 bg-clip-text text-transparent whitespace-nowrap">🏆 BOLÃO COPA 2026</h1>
          <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold border truncate max-w-[150px] sm:max-w-none ${isAdmin ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            {isAdmin ? 'Modo: Admin' : `Olá, ${usuarioLogado.nome}`}
          </span>
        </div>

        <nav className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold overflow-x-auto w-full lg:w-auto whitespace-nowrap scrollbar-none">
          <button onClick={() => setAbaAtiva('visualizacao')} className={`px-3 py-1.5 rounded-lg transition ${abaAtiva === 'visualizacao' ? 'bg-yellow-500 text-slate-950' : 'text-slate-400'}`}>
            {isAdmin ? '👁️ Ver Grupos' : '📝 Meus Palpites'}
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

      {abaAtiva === 'visualizacao' && (
        <div 
          onWheel={rolarDatasComMouse} 
          className="bg-slate-950 border-b border-slate-800 py-3 sticky top-[108px] lg:top-[57px] z-40 shadow-sm overflow-x-auto sm:scrollbar-thin sm:scrollbar-thumb-slate-700 sm:scrollbar-track-slate-900"
        >
          <div className="max-w-6xl mx-auto px-4 flex gap-2">
            {diasCopa.map(d => (
              <button 
                key={d.data} 
                onClick={() => setDiaSelecionado(d.data)} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                  diaSelecionado === d.data 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-950 border-yellow-400' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">

        {abaAtiva === 'visualizacao' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="w-full lg:col-span-2 space-y-4">
              {jogosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs font-bold">Nenhum jogo regular agendado para este dia.</div>
              ) : (
                jogosFiltrados.map(j => (
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
              <p className="text-sm font-bold text-yellow-400">{usuarioLogado.nome}</p>
              <p className="text-[11px] text-slate-400 mt-2">Você está autenticado. Os palpites salvam no seu perfil. Palpites fechados durante os jogos em andamento.</p>
            </div>
          </div>
        )}

        {abaAtiva === 'mata-mata' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 justify-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <button onClick={() => setFaseMataMataAtiva('16avos')} className={`px-4 py-2 rounded-xl text-xs font-black border transition ${faseMataMataAtiva === '16avos' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                16 de Final 
              </button>
              <button onClick={() => setFaseMataMataAtiva('oitavas')} className={`px-4 py-2 rounded-xl text-xs font-black border transition ${faseMataMataAtiva === 'oitavas' ? 'bg-green-600 border-green-400 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                Oitavas 
              </button>
              <button onClick={() => setFaseMataMataAtiva('quartas')} className={`px-4 py-2 rounded-xl text-xs font-black border transition ${faseMataMataAtiva === 'quartas' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                Quartas 
              </button>
              <button onClick={() => setFaseMataMataAtiva('semi')} className={`px-4 py-2 rounded-xl text-xs font-black border transition ${faseMataMataAtiva === 'semi' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                Semifinais
              </button>
              <button onClick={() => setFaseMataMataAtiva('final')} className={`px-4 py-2 rounded-xl text-xs font-black border transition ${faseMataMataAtiva === 'final' ? 'bg-amber-500 border-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                Finais 
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {jogosMataMataFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs font-bold col-span-2">
                  Nenhum jogo de mata-mata cadastrado na fase "{faseMataMataAtiva === '16avos' ? '16 de final' : faseMataMataAtiva}" por enquanto.
                </div>
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
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 font-bold">
                  💡 <b>Painel Admin:</b> Filtre os jogos normais pela barra de dias superior. Para gerenciar os resultados do mata-mata, você pode usar a própria aba de chaveamento ativando o modo de gravação.
               </div>
              {jogosFiltrados.map(j => <CardJogoDuplo key={j.id} jogo={j} participanteId={participanteSelecionado} isAdmin={true} visaoApenasLeitura={false} onSalvarPalpite={lidarSalvarPalpite} onSalvarResultadoReal={lidarSalvarResultadoReal} />)}
            </div>
            
            <div className="space-y-4 w-full">
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-2">👤 Modificar Palpites de:</h3>
                <select value={participanteSelecionado} onChange={(e) => setParticipanteSelecionado(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 focus:outline-none">
                  {participantes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-2">🚫 Bloquear na Rodada Atual</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {participantes.map(p => {
                    const jogoExemplo = jogosFiltrados[0];
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
                  <input type="text" placeholder="Nome do amigo" value={novoParticipanteNome} onChange={(e) => setNovoParticipanteNome(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-200 focus:outline-none" required />
                  <input type="text" placeholder="Celular (Ex: 12999999999)" value={novoParticipanteCelular} onChange={(e) => setNovoParticipanteCelular(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-200 focus:outline-none" required />
                  <button type="submit" className="w-full bg-green-500 text-slate-950 font-black py-2 rounded-xl text-xs hover:brightness-110 shadow-md transition">Adicionar no Banco</button>
                </form>
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
            {Object.keys(tabelasCopa).map(letra => (
              <div key={letra} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg w-full">
                <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2.5 flex justify-between items-center">
                  <h3 className="font-black text-sm text-yellow-500">GRUPO {letra}</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PTS | SG | GP</span>
                </div>
                <div className="p-2 space-y-1.5">
                  {tabelasCopa[letra] && tabelasCopa[letra].map((time, idx) => (
                    <div key={time.nome} className="flex items-center justify-between text-xs font-bold px-2 py-1.5 hover:bg-slate-900/40 rounded transition">
                      <div className="flex items-center gap-2 truncate mr-2">
                        <span className="text-[10px] font-mono text-slate-500 w-3">{idx + 1}</span>
                        <img src={time.escudo} alt="" className="w-6 h-4 object-cover rounded shadow-sm border border-slate-800 flex-shrink-0" />
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

      </main>
    </div>
  );
}