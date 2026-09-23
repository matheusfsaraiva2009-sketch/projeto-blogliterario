(function () {
  // ---------- Geração dos selos (carimbos) ----------
  let stampCounter = 0;
  function buildStamp(el) {
    stampCounter++;
    const id = 'stamp' + stampCounter;
    const top = el.getAttribute('data-top') || '';
    const bottom = el.getAttribute('data-bottom') || '';
    const center = el.getAttribute('data-center') || '';
    const color = el.getAttribute('data-color') || 'var(--stamp)';
    el.classList.add('stamp-svg-holder');
    el.style.color = color;
    el.innerHTML = `
    <svg viewBox="0 0 200 200" class="stamp-svg" role="img" aria-label="${top} ${bottom}">
      <defs>
        <filter id="rough-${id}" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${stampCounter}" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5"/>
        </filter>
        <path id="circTop-${id}" d="M 20,105 A 80,80 0 1,1 180,105" fill="none"/>
        <path id="circBot-${id}" d="M 32,140 A 80,80 0 0,0 168,140" fill="none"/>
      </defs>
      <g filter="url(#rough-${id})">
        <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" stroke-width="3"/>
        <circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" stroke-width="1.2"/>
        <text font-family="'Special Elite', monospace" font-size="12.5" letter-spacing="2" fill="currentColor">
          <textPath href="#circTop-${id}" startOffset="50%" text-anchor="middle">${top}</textPath>
        </text>
        <text font-family="'Special Elite', monospace" font-size="11" letter-spacing="1.5" fill="currentColor">
          <textPath href="#circBot-${id}" startOffset="50%" text-anchor="middle">${bottom}</textPath>
        </text>
        <text x="100" y="112" font-family="'Fraunces', serif" font-weight="700" font-size="26" fill="currentColor" text-anchor="middle">${center}</text>
      </g>
    </svg>`;
  }
  document.querySelectorAll('[data-stamp]').forEach(buildStamp);


  // ---------- Navegação por abas ----------
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('.panel'));

  // ---------- Animações: Transição de Abas com Fade ----------
  function activate(tabName, moveFocus) {
    tabs.forEach(t => {
      const on = t.dataset.tab === tabName;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && moveFocus) t.focus();
    });
    panels.forEach(p => {
      if (p.id === tabName) {
        p.hidden = false;
        p.classList.remove('fade-panel', 'visible');
        // Força reflow para reiniciar a animação
        void p.offsetHeight;
        p.classList.add('fade-panel');
        requestAnimationFrame(() => p.classList.add('visible'));
      } else {
        p.hidden = true;
        p.classList.remove('fade-panel', 'visible');
      }
    });
    history.replaceState(null, '', '#' + tabName);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab.dataset.tab, false));
    tab.addEventListener('keydown', (e) => {
      let idx = i;
      if (e.key === 'ArrowRight') idx = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') idx = (i - 1 + tabs.length) % tabs.length;
      else return;
      e.preventDefault();
      activate(tabs[idx].dataset.tab, true);
    });
  });

  const initial = (location.hash || '').replace('#', '');
  const valid = ['inicio', 'biblioteca', 'personalidades', 'filmes', 'equipe'];
  activate(valid.includes(initial) ? initial : 'inicio', false);

  // ---------- Cartões de navegação (Início) ----------
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => {
      activate(el.dataset.goto, false);
      document.querySelector('.site-header').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ---------- Linha do Tempo (Timeline) ----------
  const timelineData = [
    { year: '1824', title: 'A Primeira Constituição', desc: 'Autorgrafada por D. Pedro I, estabeleceu o Império do Brasil. O poder moderador dava controle absoluto ao imperador, o voto era censitário e a escravidão foi mantida, excluindo a maioria da população de qualquer cidadania.' },
    { year: '1888', title: 'Abolição da Escravatura', desc: 'Com a Lei Áurea, o Brasil foi o último país das Américas a abolir legalmente a escravidão. Resultado de décadas de pressão popular e de abolicionistas, não garantiu terras, educação ou integração social aos libertos.' },
    { year: '1891', title: 'A Primeira República', desc: 'A primeira Constituição Republicana instituiu o federalismo e o voto direto, mas excluiu os analfabetos (a grande maioria) e as mulheres. O período ficou marcado pelo voto de cabresto e pela política dos governadores.' },
    { year: '1932', title: 'Voto Feminino', desc: 'Após anos de mobilização sufragista liderada por Bertha Lutz, as mulheres conquistaram o direito ao voto no Brasil. Também foram criados o voto secreto e a Justiça Eleitoral.' },
    { year: '1946', title: 'Redemocratização', desc: 'Após a ditadura do Estado Novo de Vargas, o Brasil promulgou nova constituição democrática. Foi um período de florescimento cultural e liberdade de imprensa, embora os analfabetos continuassem sem direito ao voto.' },
    { year: '1964', title: 'O Golpe Militar', desc: 'Um golpe derrubou o presidente João Goulart e instalou uma ditadura que durou 21 anos. O regime perseguiu opositores, cassou direitos políticos, fechou o Congresso, censurou a imprensa e cometeu graves violações de direitos humanos.' },
    { year: '1984', title: 'Diretas Já', desc: 'O maior movimento de massas da história do Brasil levou milhões às ruas pedindo eleições diretas. A emenda foi derrotada no Congresso, mas a pressão popular acelerou o fim da ditadura e elegeu o primeiro presidente civil.' },
    { year: '1988', title: 'A Constituição Cidadã', desc: 'Fruto de intensa mobilização popular na Assembleia Nacional Constituinte, a Constituição ampliou direitos civis e sociais, garantiu o voto aos analfabetos, criminalizou o racismo, reconheceu direitos indígenas e criou o SUS.' }
  ];

  const timelineTrack = document.getElementById('timeline-track');
  const timelineDisplay = document.getElementById('timeline-display');

  if (timelineTrack && timelineDisplay) {
    timelineData.forEach((item, index) => {
      const node = document.createElement('button');
      node.className = 'timeline-node' + (index === 0 ? ' active' : '');
      node.setAttribute('data-year', item.year);
      node.setAttribute('aria-label', 'Ano ' + item.year + ': ' + item.title);
      node.textContent = item.year;

      node.addEventListener('click', () => {
        timelineTrack.querySelectorAll('.timeline-node').forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        timelineDisplay.classList.add('fade');
        setTimeout(() => {
          timelineDisplay.innerHTML = '<div class="eyebrow">Marco Histórico — ' + item.year + '</div><h4>' + item.title + '</h4><p>' + item.desc + '</p>';
          timelineDisplay.classList.remove('fade');
        }, 300);
        node.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });

      timelineTrack.appendChild(node);
    });

    timelineDisplay.innerHTML = '<div class="eyebrow">Marco Histórico — ' + timelineData[0].year + '</div><h4>' + timelineData[0].title + '</h4><p>' + timelineData[0].desc + '</p>';
  }

  // ---------- Categorias Temáticas da Biblioteca ----------
  const categoriesData = [
    {
      id: 'all',
      emoji: '📚',
      label: 'Todas as Obras',
      theme: 'Explore o acervo completo — livros, ensaios e documentos sobre democracia, cidadania e liberdade.'
    },
    {
      id: 'brasil',
      emoji: '🇧🇷',
      label: 'Brasil e Democracia',
      theme: 'Obras relacionadas à formação da sociedade brasileira, desigualdade, cidadania, política brasileira e questões sociais que influenciam a construção democrática do país.'
    },
    {
      id: 'politica',
      emoji: '🏛️',
      label: 'Política e Poder',
      theme: 'Obras que discutem Estado, governo, democracia, poder, autoridade, organização política e relações entre indivíduo e sociedade.'
    },
    {
      id: 'liberdade',
      emoji: '✊',
      label: 'Liberdade e Resistência',
      theme: 'Obras relacionadas à liberdade, opressão, resistência, direitos humanos, luta social, emancipação e busca por justiça.'
    },
    {
      id: 'ditadura',
      emoji: '⚔️',
      label: 'Ditadura e Memória',
      theme: 'Obras sobre a Ditadura Militar brasileira (1964–1985), repressão política, censura, perseguição, resistência, memória histórica e processo de redemocratização.'
    },
    {
      id: 'educacao',
      emoji: '🧑\u200d🏫',
      label: 'Educação e Cidadania',
      theme: 'Obras que discutem educação, formação crítica, cidadania, conscientização, participação social e transformação da sociedade.'
    },
    {
      id: 'autoritarismo',
      emoji: '🧠',
      label: 'Autoritarismo e Controle',
      theme: 'Obras que abordam autoritarismo, totalitarismo, censura, vigilância, controle social, manipulação, concentração de poder e perda das liberdades individuais.'
    },
    {
      id: 'comercial',
      emoji: '💵',
      label: 'Obras Comerciais (Livros Pagos)',
      theme: 'Obras recomendadas disponíveis em livrarias e bibliotecas (obras comerciais com leitura paga).'
    }
  ];

  // ---------- Estante de Livros (Biblioteca) ----------
  const booksData = [
    /* ── CATEGORIA 1: BRASIL E DEMOCRACIA ── */
    {
      id: 'constituicao',
      type: 'public',
      categories: ['brasil'],
      title: 'Constituição da República Federativa do Brasil',
      shortTitle: 'Constituição Federal',
      year: '1988',
      author: 'Assembleia Nacional Constituinte',
      badge: 'Domínio público',
      cover: { bg: 'linear-gradient(160deg,#123321 0%,#1f6b3d 100%)', text: '#efe6d0', icon: '⚖️' },
      coverImg: 'capas/constituicao.jpg',
      eyebrow: 'Lei nº 9.610/1998, art. 45',
      body: `<p>Conhecida como a <strong>"Constituição Cidadã"</strong>, é o texto que ainda hoje organiza a democracia brasileira. Foi promulgada em 5 de outubro de 1988, encerrando o processo de redemocratização que sucedeu a ditadura militar (1964–1985).</p>
        <blockquote>"Nós, representantes do povo brasileiro... promulgamos a seguinte Constituição da República Federativa do Brasil."</blockquote>
        <div class="art"><strong>Art. 1º</strong> A República Federativa do Brasil constitui-se em Estado democrático de direito. <strong>Parágrafo único.</strong> Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente.</div>`,
      link: { href: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm', label: 'Ler a Constituição completa' }
    },

    {
      id: 'sertoes',
      type: 'public',
      categories: ['brasil', 'liberdade'],
      title: 'Os Sertões',
      shortTitle: 'Os Sertões',
      year: '1902',
      author: 'Euclides da Cunha',
      badge: 'Domínio público',
      cover: { bg: 'linear-gradient(160deg,#5c3a1e 0%,#8b5e3c 100%)', text: '#fdf5e6', icon: '🏜️' },
      coverImg: 'capas/sertoes.jpg',
      eyebrow: 'Domínio público desde 1980',
      body: `<p>Enviado como correspondente para cobrir a Guerra de Canudos (1896–1897), Euclides da Cunha transformou suas reportagens em um dos livros mais estudados sobre o Brasil. Dividida em três partes — <em>"A Terra"</em>, <em>"O Homem"</em> e <em>"A Luta"</em> —, a obra expõe o confronto entre o Estado e o sertão nordestino, questionando quem, afinal, tem direito à cidadania num país tão desigual.</p>`,
      link: { href: 'https://www.baixelivros.com.br/literatura-brasileira/os-sertoes', label: 'Ler online (domínio público)' }
    },
    {
      id: 'cartas-chilenas',
      type: 'public',
      categories: ['brasil', 'politica'],
      title: 'Cartas Chilenas',
      shortTitle: 'Cartas Chilenas',
      year: 'c. 1788',
      author: 'Atrib. Tomás A. Gonzaga',
      badge: 'Domínio público',
      cover: { bg: 'linear-gradient(160deg,#2c3e6e 0%,#4a6fa5 100%)', text: '#f0f4ff', icon: '✉️' },
      coverImg: 'capas/cartas-chilenas.jpg',
      eyebrow: 'Atribuídas a Tomás Antônio Gonzaga',
      body: `<p>Sob o pseudônimo de Critilo, um poeta árcade denunciou em treze cartas satíricas os abusos do governador de Minas Gerais — disfarçado de governador do "Chile" para escapar da censura. Escritas às vésperas da Inconfidência Mineira, são um dos primeiros grandes retratos literários da corrupção e do abuso de poder no Brasil colonial.</p>`,
      link: { href: 'https://www.baixelivros.com.br/literatura-brasileira/cartas-chilenas', label: 'Ler online (domínio público)' }
    },
    {
      id: 'cidadania',
      type: 'recommended',
      categories: ['brasil', 'politica', 'comercial'],
      title: 'Cidadania no Brasil: o Longo Caminho',
      shortTitle: 'Cidadania no Brasil',
      year: '2001',
      author: 'José Murilo de Carvalho',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#1a1a2e 0%,#16213e 100%)', text: '#e0e0e0', icon: '🗳️' },
      coverImg: 'capas/cidadania.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Um clássico da historiografia brasileira sobre como — e o quanto — os direitos civis, políticos e sociais avançaram (ou não) no país desde a Independência. Carvalho mostra que no Brasil, ao contrário do caminho europeu, os direitos sociais chegaram antes dos civis e políticos — o que moldou nossa democracia até hoje.</p>`,
      link: { href: 'https://www.estantevirtual.com.br/livros/jose-murilo-de-carvalho/cidadania-no-brasil-o-longo-caminho', label: 'Comprar na Estante Virtual' }
    },
    {
      id: 'democracias-morrem',
      type: 'recommended',
      categories: ['politica', 'brasil', 'comercial'],
      title: 'Como as Democracias Morrem',
      shortTitle: 'Como as Democracias Morrem',
      year: '2018',
      author: 'Levitsky & Ziblatt',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#7b1818 0%,#b03030 100%)', text: '#fff0f0', icon: '📉' },
      coverImg: 'capas/democracias-morrem.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Os cientistas políticos Steven Levitsky e Daniel Ziblatt comparam casos ao redor do mundo para entender como democracias deixam de morrer por golpes repentinos e passam a corroer por dentro, aos poucos — pela erosão das instituições, do judiciário e da imprensa livre.</p>`,
      link: { href: 'https://www.companhiadasletras.com.br/livro/detalhe/produto/9788537818008/como-as-democracias-morrem', label: 'Comprar na Companhia das Letras' }
    },
    {
      id: 'dinheiro',
      type: 'recommended',
      categories: ['politica', 'brasil', 'comercial'],
      title: 'Dinheiro, Eleições e Poder',
      shortTitle: 'Dinheiro, Eleições e Poder',
      year: '2018',
      author: 'Bruno Carazza',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#3d2b00 0%,#7a5800 100%)', text: '#fff8e1', icon: '💰' },
      coverImg: 'capas/dinheiro.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Um raio-x de como o financiamento de campanhas molda o Congresso Nacional brasileiro e as leis que ele aprova — ou deixa de aprovar. Carazza traça as conexões entre o dinheiro privado e as decisões públicas, mostrando como o poder econômico interfere na democracia representativa.</p>`,
      link: { href: 'https://www.companhiadasletras.com.br/livro/9788543106847/dinheiro-eleicoes-e-poder', label: 'Comprar na Companhia das Letras' }
    },
    {
      id: 'abol',
      type: 'public',
      categories: ['liberdade', 'brasil'],
      title: 'O Abolicionismo',
      shortTitle: 'O Abolicionismo',
      year: '1883',
      author: 'Joaquim Nabuco',
      badge: 'Domínio Público',
      cover: { bg: '#2c3e50', text: '#fff', icon: '📖' },
      coverImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgrqRHnzodrxxZjSYHgLN-5r3TAMq5RF0bRWONadvz2uZZ09V82QP2yJcd9XgNhcJoO3DF8Bs6HICVfZWNd44Kg52XTzmi5kGa3DUOgQ&s=10',
      eyebrow: 'Clássico da Democracia',
      body: '<p>Publicado em 1883, quando a escravidão ainda era legal no Brasil, este é o manifesto mais eloquente já escrito contra o cativeiro. Nabuco não apenas condena a escravidão moralmente: ele demonstra, passo a passo, como ela envenenava a economia, a política e a cultura — tornando impossível qualquer democracia genuína. Lendo hoje, a obra surpreende pela atualidade dos argumentos sobre desigualdade e cidadania.</p>',
      link: { href: 'https://pt.wikisource.org/wiki/O_Abolicionismo', label: 'Ler online (Wikisource)' }
    },
    {
      id: 'ilusao',
      type: 'public',
      categories: ['brasil', 'politica'],
      title: 'A Ilusão Americana',
      shortTitle: 'A Ilusão Americana',
      year: '1893',
      author: 'Eduardo Prado',
      badge: 'Domínio Público',
      cover: { bg: '#2c3e50', text: '#fff', icon: '📖' },
      coverImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS74OADH_7TkABn_An3qQebupRj3L2ANkuhmEbLjbLWDQ&s=10',
      eyebrow: 'Análise Política',
      body: '<p>Publicado em 1893 e quase imediatamente apreendido pelo governo republicano, este ensaio polêmico denunciava que a jovem República Brasileira, ao copiar o modelo norte-americano, estava iludindo-se: as instituições importadas não combinavam com a realidade nacional. Eduardo Prado foi um dos primeiros a questionar, com rigor, o que significa construir uma democracia num país de tradição colonial e monarquista.</p>',
      link: { href: 'https://www2.senado.leg.br/bdsf/bitstream/handle/id/658134/Ilusao_americana.pdf', label: 'Ler online (PDF)' }
    },
    {
      id: 'populacoes',
      type: 'public',
      categories: ['brasil'],
      title: 'Populações Meridionais do Brasil',
      shortTitle: 'Populações Meridionais',
      year: '1920',
      author: 'Oliveira Vianna',
      badge: 'Domínio Público',
      cover: { bg: '#2c3e50', text: '#fff', icon: '📖' },
      coverImg: 'https://img.travessa.com.br/livro/BA/93/9385db35-52e4-41a5-9b4e-06c3f865d9d1.jpg',
      eyebrow: 'Sociologia Brasileira',
      body: '<p>Oliveira Vianna parte de uma análise minuciosa das populações rurais do Sul e do Centro do Brasil para explicar por que o país historicamente resistiu à democracia liberal. O sociólogo descreve o <em>clã parental</em>, o coronelismo e o isolamento do campo como forças que moldaram uma sociedade avessa à vida pública e ao voto livre. Obra essencial — mesmo que controversa — para entender o Brasil profundo e suas dificuldades políticas.</p>',
      link: { href: 'http://www2.senado.leg.br/bdsf/handle/id/1108', label: 'Ler online (Senado)' }
    },
    {
      id: 'policarpo',
      type: 'public',
      categories: ['brasil', 'politica'],
      title: 'Triste Fim de Policarpo Quaresma',
      shortTitle: 'Policarpo Quaresma',
      year: '1911',
      author: 'Lima Barreto',
      badge: 'Domínio Público',
      cover: { bg: '#2c3e50', text: '#fff', icon: '📖' },
      coverImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Triste_fim_de_policarpo_quaresma_1a_edicao.png/330px-Triste_fim_de_policarpo_quaresma_1a_edicao.png',
      eyebrow: 'Ficção e Crítica Social',
      body: '<p>Policarpo Quaresma acredita no Brasil com uma fé quase ingênua: aprende tupi, cultiva a terra, escreve ao governo. A cada passo, o Estado e a sociedade que ele queria servir o traem, prendem e, por fim, fuzilam. Lima Barreto usou a trajetória desse funcionário público idealista para denunciar, com ironia cortante, o patriotismo vazio, o militarismo de Floriano Peixoto e a república que nascia excluindo os mais pobres da cidadania.</p>',
      link: { href: 'https://bd.camara.leg.br/bd/handle/bdcamara/33419', label: 'Ler online (Câmara)' }
    },
    {
      id: 'bras-cubas',
      type: 'public',
      categories: ['brasil'],
      title: 'Memórias Póstumas de Brás Cubas',
      shortTitle: 'Brás Cubas',
      year: '1881',
      author: 'Machado de Assis',
      badge: 'Domínio Público',
      cover: { bg: '#2c3e50', text: '#fff', icon: '📖' },
      coverImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Memorias_Posthumas_de_Braz_Cubas.jpg/330px-Memorias_Posthumas_de_Braz_Cubas.jpg',
      eyebrow: 'Clássico Nacional',
      body: '<p>Narrado por um defunto, Brás Cubas conta sua própria vida com uma frieza cínica que só a morte poderia dar. Machado de Assis criou, assim, um espelho devastador da elite brasileira do século XIX: seus personagens mentem, trocam de lado, usam os mais fracos sem culpa. Um romance que parece escrito hoje — e que explica, com genialidade, por que a democracia formal convive tão facilmente com a desigualdade real no Brasil.</p>',
      link: { href: 'https://pt.wikisource.org/wiki/Mem%C3%B3rias_P%C3%B3stumas_de_Br%C3%A1s_Cubas', label: 'Ler online (Wikisource)' }
    },
    {
      id: 'cortico',
      type: 'public',
      categories: ['brasil'],
      title: 'O Cortiço',
      shortTitle: 'O Cortiço',
      year: '1890',
      author: 'Aluísio Azevedo',
      badge: 'Domínio Público',
      cover: { bg: '#2c3e50', text: '#fff', icon: '📖' },
      coverImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/O_corti%C3%A7o_1a_edicao.png/330px-O_corti%C3%A7o_1a_edicao.png',
      eyebrow: 'Naturalismo Brasileiro',
      body: '<p>No mesmo ano em que o Brasil proclamava a República, Aluísio Azevedo publicava este romance brutal sobre o cotidiano de um cortiço carioca. Trabalhadores imigrantes, ex-escravizados e pobres livres dividem o mesmo espaço miserável enquanto o proprietário enriquece sobre eles. A obra mostra que a mudança de regime político não alterou em nada as relações de exploração — uma lição que ressoa na história da democracia brasileira.</p>',
      link: { href: 'https://pt.wikisource.org/wiki/O_Corti%C3%A7o', label: 'Ler online (Wikisource)' }
    },
    {
      id: 'manifesto',
      type: 'public',
      categories: ['brasil', 'politica'],
      title: 'Manifesto Republicano de 1870',
      shortTitle: 'Manifesto Republicano',
      year: '1870',
      author: 'Vários Autores',
      badge: 'Documento Histórico',
      cover: { bg: '#2c3e50', text: '#fff', icon: '📖' },
      coverImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/A-republica-3-12-1870.jpg/330px-A-republica-3-12-1870.jpg',
      eyebrow: 'História Política',
      body: '<p>Publicado na primeira edição do jornal <em>A República</em>, em 3 de dezembro de 1870, este documento fundou o Partido Republicano Brasileiro e deu a largada ao movimento que derrubaria a monarquia 19 anos depois. O texto defende federalismo, separação entre Igreja e Estado, eleições livres e autonomia das províncias. Lê-lo é entender o que os republicanos brasileiros prometeram — e o quanto dessas promessas foi cumprido.</p>',
      link: { href: 'https://pt.wikipedia.org/wiki/Manifesto_Republicano_de_1870', label: 'Ver no Wikipedia' }
    },
    {
      id: 'evolucao',
      type: 'recommended',
      categories: ['brasil', 'politica'],
      title: 'Evolução Política do Brasil',
      shortTitle: 'Evolução Política',
      year: '1933',
      author: 'Caio Prado Júnior',
      badge: 'Leitura Recomendada',
      cover: { bg: '#2c3e50', text: '#fff', icon: '📖' },
      coverImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUQveuKjt4FMGwWLwI2Z-FKrginbWpX81s41olevoMBnI9oouEKNPOUVN-&s=10',
      eyebrow: 'História e Política',
      body: '<p>Em apenas cem páginas densas, Caio Prado Júnior reescreve a história do Brasil a partir do materialismo histórico. Sua tese central: a colonização estruturou o país para exportar riqueza para fora, não para construir uma sociedade interna igualitária — e esse legado colonial atravessa toda a história política nacional, dificultando a formação de uma democracia de fato popular. Obra pioneira, escrita quando o autor tinha apenas 23 anos.</p>',
      link: { href: 'https://edisciplinas.usp.br/pluginfile.php/298816/mod_resource/content/1/Caio%20Prado%20J%C3%BAnior.%20Evolu%C3%A7%C3%A3o%20Pol%C3%ADtica%20do%20Brasil.pdf', label: 'Ler online (PDF)' }
    },
    {
      id: 'raizes',
      type: 'recommended',
      categories: ['brasil', 'politica'],
      title: 'Raízes do Brasil',
      shortTitle: 'Raízes do Brasil',
      year: '1936',
      author: 'Sérgio Buarque de Holanda',
      badge: 'Leitura Recomendada',
      cover: { bg: '#2c3e50', text: '#fff', icon: '📖' },
      coverImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Ra%C3%ADzes_do_Brasil.jpg/330px-Ra%C3%ADzes_do_Brasil.jpg',
      eyebrow: 'Ensaio Clássico',
      body: '<p>O conceito do <em>"homem cordial"</em> — criado por Sérgio Buarque de Holanda neste ensaio de 1936 — entrou para o vocabulário da cultura brasileira e ainda explica muito. Cordialidade, aqui, não é gentileza: é a dificuldade de separar o público do privado, as relações pessoais das institucionais. Para o autor, essa herança ibérica foi o maior obstáculo à construção de uma democracia moderna no Brasil. Um livro que todo cidadão deveria ler.</p>',
      link: { href: 'https://www.companhiadasletras.com.br/livro/9788535930986/raizes-do-brasil', label: 'Ver na editora' }
    },
    {
      id: 'casagrande',
      type: 'recommended',
      categories: ['brasil'],
      title: 'Casa-Grande & Senzala',
      shortTitle: 'Casa-Grande & Senzala',
      year: '1933',
      author: 'Gilberto Freyre',
      badge: 'Leitura Recomendada',
      cover: { bg: '#2c3e50', text: '#fff', icon: '📖' },
      coverImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTxUnK1bvoF3fkyxMWHlxtlM-a6HgOg3FgFO1SfPdUjQ&s=10',
      eyebrow: 'Sociologia',
      body: '<p>Gilberto Freyre provocou o Brasil de 1933 ao argumentar que a miscigenação — ao invés de ser uma fraqueza — era a singularidade da civilização brasileira. Sua análise da casa-grande e da senzala como espaços de formação cultural é ao mesmo tempo fascinante e controversa: foi acusado de romantizar a escravidão. Lê-lo criticamente é uma das melhores formas de entender os debates sobre raça, poder e identidade que ainda moldam nossa democracia.</p>',
      link: { href: 'https://edisciplinas.usp.br/pluginfile.php/4379373/mod_resource/content/1/Casa-Grande%20e%20Senzala.pdf', label: 'Ler online (PDF)' }
    },
    /* ── CATEGORIA 3: LIBERDADE E RESISTÊNCIA ── */
    {
      id: 'pedagogia-oprimido',
      type: 'recommended',
      categories: ['educacao', 'liberdade', 'comercial'],
      title: 'Pedagogia do Oprimido',
      shortTitle: 'Pedagogia do Oprimido',
      year: '1968',
      author: 'Paulo Freire',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#8b1a1a 0%,#c0392b 100%)', text: '#ffe8e8', icon: '📚' },
      coverImg: 'https://img.travessa.com.br/livro/BA/5c/5c643ca4-f411-44b6-97d2-2f76ab52d858.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Uma das obras de ciências sociais mais lidas e citadas do mundo. Paulo Freire argumenta que a educação tradicional — chamada por ele de "bancária" — reproduz a opressão ao tratar o aluno como depósito passivo de informações. A verdadeira educação, para Freire, é dialógica, crítica e libertadora. Escrita durante o exílio imposto pela ditadura, a obra é inseparável da luta pela democracia e pela cidadania plena.</p>`,
      link: { href: 'https://acervo.paulofreire.org/items/9e76c4ec-8417-4e1f-9e59-171f37c2ea4f', label: 'Ver no Acervo Paulo Freire' }
    },
    {
      id: 'revolucao-bichos',
      type: 'recommended',
      categories: ['autoritarismo', 'politica'],
      title: 'A Revolução dos Bichos',
      shortTitle: 'A Revolução dos Bichos',
      year: '1945',
      author: 'George Orwell',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#4a7c59 0%,#2d5a3d 100%)', text: '#fff', icon: '🐷' },
      coverImg: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Animal_Farm_-_1st_edition.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Fábula política em que os animais de uma fazenda se rebelam contra seus donos humanos em busca de liberdade e igualdade. Com o tempo, os porcos que lideraram a revolução passam a reproduzir exatamente a opressão que combateram. Orwell cria uma das mais poderosas alegorias sobre como regimes autoritários corrompem ideais democráticos e se perpetuam pelo controle da linguagem e da informação.</p>`,
      link: { href: 'https://especiais.gazetadopovo.com.br/ebook-revolucao-dos-bichos/', label: 'Ler online (e-book gratuito)' }
    },

    {
      id: 'o-processo',
      type: 'recommended',
      categories: ['autoritarismo', 'politica'],
      title: 'O Processo',
      shortTitle: 'O Processo',
      year: '1925',
      author: 'Franz Kafka',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#2d2d2d 0%,#555555 100%)', text: '#f5f5f5', icon: '⚖️' },
      coverImg: 'https://cdl-static.s3-sa-east-1.amazonaws.com/covers/gg/9788535937749/o-processo-edicao-especial.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Josef K. é preso certa manhã sem que nenhuma acusação lhe seja explicada. Sua tentativa de compreender e combater o processo burocrático e kafkiano que o condena é uma das mais perturbadoras metáforas já escritas sobre sistemas de poder opacos, arbitrários e desumanizantes. Obra essencial para entender como a ausência de transparência e garantias legais corrói qualquer democracia.</p>`,
      link: { href: 'https://literunico.com.br/universos/obras/93597/o-processo', label: 'Saiba mais sobre o livro' }
    },

    /* ── OUTROS TÍTULOS DO ACERVO ── */
    {
      id: 'ensaio-lucidez',
      type: 'recommended',
      categories: ['politica', 'autoritarismo', 'comercial'],
      title: 'Ensaio sobre a Lucidez',
      shortTitle: 'Ensaio sobre a Lucidez',
      year: '2004',
      author: 'José Saramago',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#1a1a2e 0%,#3a3a5c 100%)', text: '#e8e8ff', icon: '🗳️' },
      coverImg: 'https://cdl-static.s3-sa-east-1.amazonaws.com/covers/gg/9788535930351/ensaio-sobre-a-lucidez-nova-edicao.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Em uma cidade imaginária, a maioria esmagadora dos eleitores entrega cédulas em branco numa eleição. O governo, em pânico, interpreta o ato como subversão e reage com repressão crescente. Saramago explora, com sua prosa única, a tensão entre consciência política coletiva e o autoritarismo de Estado — questionando o que significa votar com lucidez numa democracia.</p>`,
      link: { href: 'https://www.josesaramago.org/livro/ensaio-sobre-a-lucidez/', label: 'Saiba mais sobre o livro' }
    },
    {
      id: 'racismo-estrutural',
      type: 'recommended',
      categories: ['brasil', 'liberdade', 'comercial'],
      title: 'Racismo Estrutural',
      shortTitle: 'Racismo Estrutural',
      year: '2018',
      author: 'Silvio Luiz de Almeida',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#1a0a00 0%,#4d2600 100%)', text: '#ffe8cc', icon: '✊' },
      coverImg: 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/0b/Livro_Racismo_Estrutural.jpg/250px-Livro_Racismo_Estrutural.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Silvio Luiz de Almeida demonstra que o racismo não é apenas um conjunto de atitudes individuais, mas um elemento constitutivo das instituições políticas, jurídicas e econômicas do Brasil. A obra é indispensável para compreender por que a democracia formal não se traduz em igualdade real enquanto o racismo estrutural não for enfrentado de forma sistemática.</p>`,
      link: { href: 'https://books.google.com.br/books?hl=pt-BR&id=LyqsDwAAQBAJ', label: 'Ver no Google Books' }
    },
    {
      id: 'brasil-biografia',
      type: 'recommended',
      categories: ['brasil', 'comercial'],
      title: 'Brasil: uma biografia',
      shortTitle: 'Brasil: uma biografia',
      year: '2015',
      author: 'Lilia Schwarcz & Heloisa Starling',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#003366 0%,#005599 100%)', text: '#e8f4ff', icon: '🇧🇷' },
      coverImg: 'https://img.travessa.com.br/livro/BA/49/4975e323-d22f-4421-93b8-2cc44692dedc.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Um retrato completo e rigoroso do Brasil — da chegada dos portugueses até os tempos recentes. Lilia Schwarcz e Heloisa Starling tecem uma narrativa que conecta história política, cultura, violência e democracia, mostrando como o país foi se construindo entre contradições profundas. Uma das mais importantes obras de história brasileira das últimas décadas.</p>`,
      link: { href: 'https://www.companhiadasletras.com.br/livro/9788535925661/brasil-uma-biografia', label: 'Ver na Companhia das Letras' }
    },
    {
      id: 'sobre-autoritarismo',
      type: 'recommended',
      categories: ['autoritarismo', 'brasil', 'comercial'],
      title: 'Sobre o autoritarismo brasileiro',
      shortTitle: 'Sobre o autoritarismo',
      year: '2019',
      author: 'Lilia Schwarcz',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#5a0000 0%,#8b0000 100%)', text: '#ffe8e8', icon: '🚨' },
      coverImg: 'https://cdl-static.s3-sa-east-1.amazonaws.com/covers/gg/9788535932195/sobre-o-autoritarismo-brasileiro.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Lilia Schwarcz analisa as raízes históricas e culturais do autoritarismo no Brasil, mostrando como práticas antidemocráticas se reproduzem mesmo em períodos formalmente democráticos. A obra identifica padrões que percorrem séculos — do patrimonialismo à intolerância — e convida o leitor a refletir sobre os desafios ainda presentes para a consolidação da democracia brasileira.</p>`,
      link: { href: 'https://www.companhiadasletras.com.br/livro/9788535932195/sobre-o-autoritarismo-brasileiro', label: 'Ver na Companhia das Letras' }
    },
    {
      id: 'ainda-estou-aqui',
      type: 'recommended',
      categories: ['ditadura', 'brasil', 'comercial'],
      title: 'Ainda Estou Aqui',
      shortTitle: 'Ainda Estou Aqui',
      year: '2015',
      author: 'Marcelo Rubens Paiva',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#1a1a3a 0%,#2e2e5c 100%)', text: '#e8e8ff', icon: '💛' },
      coverImg: 'https://cdl-static.s3-sa-east-1.amazonaws.com/covers/gg/9788579624162/ainda-estou-aqui-o-livro-que-deu-origem-ao-filme.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Marcelo Rubens Paiva reconstrói a história de sua mãe, Eunice Paiva, e de sua família após o desaparecimento e morte de seu pai, Rubens Paiva, nas mãos da ditadura militar. Um livro que une memória afetiva e denúncia histórica, tornando-se um símbolo da luta por verdade, justiça e reparação — pilares fundamentais de qualquer democracia comprometida com seu passado.</p>`,
      link: { href: 'https://www.companhiadasletras.com.br/livro/9788579624162/ainda-estou-aqui-o-livro-que-deu-origem-ao-filme', label: 'Ver na Companhia das Letras' }
    },
    {
      id: 'zero',
      type: 'recommended',
      categories: ['ditadura', 'autoritarismo', 'comercial'],
      title: 'Zero',
      shortTitle: 'Zero',
      year: '1975',
      author: 'Ignácio de Loyola Brandão',
      badge: 'Leitura recomendada',
      cover: { bg: 'linear-gradient(160deg,#2d1b00 0%,#5a3800 100%)', text: '#fff0cc', icon: '0️⃣' },
      coverImg: 'https://img.travessa.com.br/livro/BA/47/478a8fff-6d65-4132-80a5-9a8cc0c31da9.jpg',
      eyebrow: 'Leitura recomendada',
      body: `<p>Romance experimental e provocador, censurado pela ditadura militar brasileira. Com linguagem fragmentada e colagem de gêneros — jornal, quadrinho, manifesto —, Loyola Brandão retrata uma sociedade controlada, violenta e desumanizada. <em>Zero</em> é considerado um dos grandes romances políticos brasileiros, um grito literário contra a censura e a supressão das liberdades individuais.</p>`,
      link: { href: 'https://grupoeditorialglobal.com.br/catalogos/livro/?id=1560', label: 'Ver na Editora Global' }
    }
  ];

  let activeBookId = null;
  const bookshelfGrid = document.getElementById('bookshelf-grid');
  const bookZoomView = document.getElementById('book-zoom-view');
  const bookZoomCover = document.getElementById('book-zoom-cover');
  const bookZoomInfo = document.getElementById('book-zoom-info');
  const bookZoomBack = document.getElementById('book-zoom-back');

  /* --- Gera o HTML da capa para os cards da grade --- */
  function coverHTML(book) {
    const paidBadge = (book.categories && book.categories.includes('comercial'))
      ? `<span class="book-paid-badge" title="Obra comercial (livro pago)">💵</span>`
      : '';

    if (book.coverImg) {
      return `<div class="book-cover" style="background:${book.cover.bg};">
        ${paidBadge}
        <img class="book-cover-img" src="${book.coverImg}" alt="Capa: ${book.title}" loading="lazy">
      </div>`;
    }
    return `<div class="book-cover" style="background:${book.cover.bg};color:${book.cover.text};">
      ${paidBadge}
      <span class="book-cover-icon">${book.cover.icon}</span>
      <span class="book-cover-title">${book.shortTitle}</span>
      <span class="book-cover-author">${book.author}</span>
    </div>`;
  }

  /* --- Cores de categoria --- */
  function catColor(catId) {
    const colors = {
      brasil: '#1f6b3d', politica: '#1a3a6b', liberdade: '#8b1a1a',
      ditadura: '#3a2a00', educacao: '#7a5800', autoritarismo: '#4a0080',
      comercial: '#2e7d32'
    };
    return colors[catId] || 'var(--stamp)';
  }

  /* --- Banner da categoria ativa --- */
  function renderCategoryBanner(catId) {
    const banner = document.getElementById('category-banner');
    if (!banner) return;
    if (catId === 'all') {
      banner.innerHTML = '';
      banner.style.display = 'none';
      return;
    }
    const cat = categoriesData.find(c => c.id === catId);
    if (!cat) return;
    banner.style.display = 'flex';
    banner.innerHTML = `
      <span class="cat-banner-emoji">${cat.emoji}</span>
      <div class="cat-banner-text">
        <strong>${cat.label}</strong>
        <p>${cat.theme}</p>
      </div>
      <span class="cat-banner-count">${booksData.filter(b => b.categories && b.categories.includes(catId)).length} obras</span>`;
  }

  /* --- Lógica de Pesquisa de Livros --- */
  let currentSearchQuery = '';

  function applyBooksFilter() {
    const q = currentSearchQuery.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let filtered = booksData;

    if (q !== '') {
      filtered = booksData.filter(b => {
        const title = (b.title || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const shortTitle = (b.shortTitle || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const author = (b.author || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return title.includes(q) || shortTitle.includes(q) || author.includes(q);
      });
    } else if (activeCategoryId !== 'all') {
      filtered = booksData.filter(b => b.categories && b.categories.includes(activeCategoryId));
    }

    renderBooks(filtered);
    applyBookTilt();
  }

  function setupBookshelfSearch() {
    const searchInput = document.getElementById('bookshelf-search-input');
    const searchBtn = document.getElementById('bookshelf-search-btn');
    const clearBtn = document.getElementById('bookshelf-search-clear');

    if (!searchInput) return;

    function executeSearch() {
      currentSearchQuery = searchInput.value;
      if (clearBtn) {
        clearBtn.style.display = searchInput.value ? 'block' : 'none';
      }
      applyBooksFilter();
    }

    searchInput.addEventListener('input', executeSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch();
      }
    });

    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        executeSearch();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearchQuery = '';
        clearBtn.style.display = 'none';
        applyBooksFilter();
        searchInput.focus();
      });
    }
  }

  /* --- Renderiza lista de livros filtrada --- */
  function renderBooks(books) {
    if (!bookshelfGrid) return;
    bookshelfGrid.innerHTML = '';

    if (!books.length) {
      bookshelfGrid.innerHTML = '<p class="no-books-msg">Este livro não está na estante.</p>';
      return;
    }

    books.forEach((book, i) => {
      const btn = document.createElement('button');
      btn.className = 'book-card fade-up';
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('aria-pressed', 'false');
      btn.dataset.bookId = book.id;
      btn.style.transitionDelay = Math.min(i * 0.04, 0.6) + 's';

      // Badge da categoria principal (apenas em "Todas")
      let catTag = '';
      if (activeCategoryId === 'all' && book.categories && book.categories[0]) {
        const cat = categoriesData.find(c => c.id === book.categories[0]);
        if (cat) catTag = `<span class="book-cat-tag" style="background:${catColor(book.categories[0])}">${cat.emoji} ${cat.label}</span>`;
      }



      btn.innerHTML = `<div class="book-cover-wrap">${coverHTML(book)}</div>
        <span class="book-card-label">${book.shortTitle}</span>`;
      btn.addEventListener('click', () => openBook(book.id));
      bookshelfGrid.appendChild(btn);
    });

    requestAnimationFrame(() => {
      bookshelfGrid.querySelectorAll('.fade-up').forEach(el => el.classList.add('is-visible'));
    });
  }

  /* --- Troca categoria ativa --- */
  let activeCategoryId = 'all';

  function switchCategory(catId) {
    activeCategoryId = catId;
    document.querySelectorAll('.cat-btn').forEach(btn => {
      const on = btn.dataset.catId === catId;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderCategoryBanner(catId);

    const searchInput = document.getElementById('bookshelf-search-input');
    const clearBtn = document.getElementById('bookshelf-search-clear');
    if (searchInput && searchInput.value !== '') {
      searchInput.value = '';
      currentSearchQuery = '';
      if (clearBtn) clearBtn.style.display = 'none';
    }

    applyBooksFilter();
  }

  /* --- Renderiza a grade de livros com navegação por categorias --- */
  function renderBookshelf() {
    if (!bookshelfGrid) return;

    setupBookshelfSearch();

    // Constrói os botões de categoria
    const nav = document.getElementById('category-nav');
    if (nav && !nav.children.length) {
      categoriesData.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'cat-btn' + (cat.id === 'all' ? ' active' : '');
        btn.dataset.catId = cat.id;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', cat.id === 'all' ? 'true' : 'false');
        btn.id = 'catbtn-' + cat.id;
        btn.innerHTML = `<span class="cat-emoji">${cat.emoji}</span><span class="cat-label">${cat.label}</span>`;
        btn.addEventListener('click', () => switchCategory(cat.id));
        nav.appendChild(btn);
      });
    }

    renderCategoryBanner('all');
    applyBooksFilter();
  }

  /* --- Abre o overlay de detalhe --- */
  function openBook(id) {
    activeBookId = id;
    const book = booksData.find(b => b.id === id);
    if (!book) return;

    if (book.coverImg) {
      bookZoomCover.innerHTML = `<img src="${book.coverImg}" alt="Capa: ${book.title}"
        style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;">`;
    } else {
      bookZoomCover.innerHTML = `<div style="width:100%;height:100%;background:${book.cover.bg};color:${book.cover.text};
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:1.2rem;padding:2.5rem 1.5rem;text-align:center;">
        <span style="font-size:4rem;">${book.cover.icon}</span>
        <span style="font-family:'Fraunces',serif;font-weight:700;font-size:1.1rem;line-height:1.3;">${book.title}</span>
        <span style="font-family:'Special Elite',monospace;font-size:0.82rem;opacity:0.85;">${book.author}</span>
      </div>`;
    }

    const linkHTML = book.link
      ? `<a class="btn-read" href="${book.link.href}" target="_blank" rel="noopener">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
           ${book.link.label}
         </a>`
      : `<p style="font-family:'Inter',sans-serif;font-size:0.88rem;color:var(--ink-2);margin:0;
                   background:rgba(0,0,0,0.04);padding:0.8rem 1rem;border-radius:6px;border-left:3px solid var(--line);">
           📚 Esta obra está protegida por direitos autorais. Procure-a numa biblioteca, sebo ou livraria.
         </p>`;

    // Resumo de avaliações para mostrar no detalhe
    const reviewSummaryHTML = buildReviewSummaryHTML(book.id);

    bookZoomInfo.innerHTML = `
      <div class="book-detail-meta">
        <span class="eyebrow" style="margin-bottom:0.5rem;">${book.eyebrow}</span>
        <h4>${book.title}</h4>
        <span class="detail-author">${book.author}</span>
        <span class="detail-year">${book.year}</span>
        <span class="pill-badge" style="margin-top:0.5rem;display:inline-flex;">${book.badge}</span>
      </div>
      <div class="book-detail-body">${book.body}</div>
      ${linkHTML}
      ${reviewSummaryHTML}
      <button class="btn-reviews" id="open-reviews-btn" aria-label="Ver e adicionar avaliações">
        💬 Avaliações
      </button>`;

    bookZoomView.hidden = false;
    bookZoomView.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    bookZoomView.style.animation = 'none';
    bookZoomView.offsetHeight;
    bookZoomView.style.animation = '';

    const openReviewsBtn = document.getElementById('open-reviews-btn');
    if (openReviewsBtn) {
      openReviewsBtn.addEventListener('click', () => openReviewsModal(book));
    }
  }

  function closeBook() {
    activeBookId = null;
    if (bookZoomView) {
      bookZoomView.hidden = true;
    }
    document.body.style.overflow = '';
  }

  if (bookZoomBack) bookZoomBack.addEventListener('click', closeBook);
  if (bookZoomView) {
    bookZoomView.addEventListener('click', (e) => {
      if (e.target === bookZoomView) closeBook();
    });
  }

  renderBookshelf();

  // =============================================
  // ======= SISTEMA DE AVALIAÇÕES ==============
  // =============================================

  /* --- Chaves de localStorage --- */
  const LS_SESSION_KEY = 'vlog_session';      // usuário logado { name, email }
  const LS_ACCOUNTS_KEY = 'vlog_accounts';    // { email: { name, passHash } }
  const LS_REVIEWS_KEY = 'vlog_book_reviews';// { bookId: { email: { name,email,stars,text,date } } }

  /* --- Limpeza e Reset Inicial do Banco de Dados --- */
  // Garante que o banco de dados de contas e comentários inicie vazio (como primeiro uso)
  const DB_RESET_VERSION = 'vlog_fresh_db_v2';
  if (localStorage.getItem('vlog_db_initialized') !== DB_RESET_VERSION) {
    localStorage.removeItem(LS_SESSION_KEY);
    localStorage.removeItem(LS_ACCOUNTS_KEY);
    localStorage.removeItem(LS_REVIEWS_KEY);
    localStorage.removeItem('vlog_current_user');
    localStorage.removeItem('vlog_reviews');
    localStorage.setItem('vlog_db_initialized', DB_RESET_VERSION);
  }

  /* --- Hash simples (djb2) para senha --- */
  function hashStr(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (((h << 5) + h) ^ str.charCodeAt(i)) >>> 0;
    return h.toString(16);
  }

  /* --- Contas --- */
  function getAccounts() {
    try { return JSON.parse(localStorage.getItem(LS_ACCOUNTS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveAccounts(accounts) {
    localStorage.setItem(LS_ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  /* --- Sessão --- */
  function getSession() {
    try { return JSON.parse(localStorage.getItem(LS_SESSION_KEY)) || null; }
    catch (e) { return null; }
  }
  function setSession(user) { localStorage.setItem(LS_SESSION_KEY, JSON.stringify(user)); }
  function clearSession() { localStorage.removeItem(LS_SESSION_KEY); }

  /* --- Reviews (objeto keyed por email → 1 review por usuário por livro) --- */
  function getAllReviews() {
    try { return JSON.parse(localStorage.getItem(LS_REVIEWS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function getBookReviews(bookId) {
    const all = getAllReviews();
    // Converte o mapa { email: review } em array ordenado por data decrescente
    return Object.values(all[bookId] || {}).sort((a, b) => new Date(b.ts) - new Date(a.ts));
  }
  function upsertReview(bookId, email, review) {
    const all = getAllReviews();
    if (!all[bookId]) all[bookId] = {};
    all[bookId][email] = review;
    localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(all));
  }
  function deleteReview(bookId, email) {
    const all = getAllReviews();
    if (all[bookId]) { delete all[bookId][email]; }
    localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(all));
  }

  /* --- Média de estrelas --- */
  function avgStars(reviews) {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
  }

  /* --- Resumo de avaliações (tira no detalhe do livro) --- */
  function buildReviewSummaryHTML(bookId) {
    const reviews = getBookReviews(bookId);
    if (!reviews.length) return '';
    const avg = avgStars(reviews);
    return `<div class="review-summary-strip">
      <span class="rss-stars">${renderStarsDisplay(avg)}</span>
      <span class="rss-avg">${avg.toFixed(1)}</span>
      <span class="rss-count">(${reviews.length} avaliação${reviews.length !== 1 ? 'ões' : ''})</span>
    </div>`;
  }

  /* --- Estrelas estáticas --- */
  function renderStarsDisplay(value) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const fill = value >= i ? 1 : value >= i - 0.5 ? 0.5 : 0;
      html += `<span class="star-disp" data-fill="${fill >= 1 ? 'full' : fill > 0 ? 'half' : 'empty'}">★</span>`;
    }
    return html;
  }

  /* --- Modal de Avaliações --- */
  let reviewsModalCurrentBook = null;
  let selectedStars = 0;
  /* Estado do painel de login: 'login' | 'register' */
  let authPanel = 'login';

  function openReviewsModal(book) {
    reviewsModalCurrentBook = book;
    selectedStars = 0;
    authPanel = 'login';

    let modal = document.getElementById('reviews-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'reviews-modal';
      modal.className = 'reviews-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Avaliações do livro');
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeReviewsModal(); });
    }

    renderReviewsModal(modal, book);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('is-open'));
  }

  function closeReviewsModal() {
    const modal = document.getElementById('reviews-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    setTimeout(() => {
      modal.hidden = true;
      if (bookZoomView && !bookZoomView.hidden) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }, 300);
  }

  function refreshItemStrip(itemId) {
    let strip = document.querySelector('#book-zoom-info .review-summary-strip');
    let btn = document.getElementById('open-reviews-btn');
    if (!strip && !btn) {
      strip = document.querySelector('#film-zoom-info .review-summary-strip');
      btn = document.getElementById('open-film-reviews-btn');
    }
    const newStrip = buildReviewSummaryHTML(itemId);
    if (strip) { strip.outerHTML = newStrip || ''; }
    else if (newStrip && btn) {
      btn.insertAdjacentHTML('beforebegin', newStrip);
    }
  }

  function refreshBookStrip(bookId) { refreshItemStrip(bookId); }

  function renderReviewsModal(modal, book) {
    const session = getSession();
    const reviews = getBookReviews(book.id);
    const avg = avgStars(reviews);

    /* ---------- Histórico ---------- */
    const historyHTML = reviews.length
      ? reviews.map(r => {
        const isOwn = session && session.email === r.email;
        return `<div class="review-item" data-email="${escapeHTML(r.email)}">
            <div class="review-item-header">
              <span class="review-item-user">👤 ${escapeHTML(r.name)}</span>
              <span class="review-item-stars">${renderStarsDisplay(r.stars)}</span>
              <span class="review-item-date">${r.date}</span>
              ${isOwn ? `<button class="btn-delete-review" data-email="${escapeHTML(r.email)}" aria-label="Excluir minha avaliação" title="Excluir minha avaliação">🗑️</button>` : ''}
            </div>
            ${r.text ? `<p class="review-item-text">${escapeHTML(r.text)}</p>` : ''}
          </div>`;
      }).join('')
      : `<p class="reviews-empty">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>`;

    /* ---------- Formulário ---------- */
    let formHTML;
    if (session) {
      // Verifica se o usuário já avaliou este livro
      const allRaw = getAllReviews();
      const existing = allRaw[book.id] && allRaw[book.id][session.email];
      const existingNote = existing
        ? `<p class="review-existing-note">✏️ Você já avaliou este livro. Enviar novamente <strong>substituirá</strong> sua avaliação anterior.</p>`
        : '';
      formHTML = `<div class="review-form-area">
        <div class="review-form-user-bar">
          <span>Avaliando como <strong>${escapeHTML(session.name)}</strong> <span class="review-user-email">(${escapeHTML(session.email)})</span></span>
          <button class="btn-logout-review" id="rm-logout">Sair da conta</button>
        </div>
        ${existingNote}
        <div class="review-stars-picker" id="rm-stars-picker" role="group" aria-label="Selecione de 1 a 5 estrelas">
          ${[1, 2, 3, 4, 5].map(n => `<button class="star-pick" data-star="${n}" aria-label="${n} estrela${n > 1 ? 's' : ''}">★</button>`).join('')}
        </div>
        <span class="review-stars-label" id="rm-stars-label">Clique para avaliar</span>
        <textarea class="review-textarea" id="rm-text" placeholder="Escreva seu comentário (opcional)..." rows="4" maxlength="500"></textarea>
        <div class="review-char-count"><span id="rm-char-count">0</span>/500</div>
        <button class="btn-submit-review" id="rm-submit">Enviar avaliação</button>
      </div>`;
    } else if (authPanel === 'register') {
      formHTML = `<div class="review-login-area">
        <p class="review-login-prompt">🔐 Criar conta para avaliar</p>
        <div class="review-auth-form">
          <input type="text" id="rm-reg-name" class="review-login-input" placeholder="Seu nome" maxlength="60" autocomplete="name" />
          <input type="email" id="rm-reg-email" class="review-login-input" placeholder="E-mail" maxlength="100" autocomplete="email" />
          <input type="password" id="rm-reg-pass" class="review-login-input" placeholder="Senha (mín. 6 caracteres)" maxlength="100" autocomplete="new-password" />
          <p class="review-auth-error" id="rm-reg-error" hidden></p>
          <button class="btn-login-review" id="rm-reg-btn">Criar conta</button>
        </div>
        <p class="review-login-note">Já tem conta? <button class="btn-auth-toggle" id="rm-to-login">Entrar</button></p>
      </div>`;
    } else {
      formHTML = `<div class="review-login-area">
        <p class="review-login-prompt">🔐 Entrar para avaliar</p>
        <div class="review-auth-form">
          <input type="email" id="rm-login-email" class="review-login-input" placeholder="E-mail" maxlength="100" autocomplete="email" />
          <input type="password" id="rm-login-pass" class="review-login-input" placeholder="Senha" maxlength="100" autocomplete="current-password" />
          <p class="review-auth-error" id="rm-login-error" hidden></p>
          <button class="btn-login-review" id="rm-login-btn">Entrar</button>
        </div>
        <p class="review-login-note">Não tem conta? <button class="btn-auth-toggle" id="rm-to-register">Criar conta</button></p>
      </div>`;
    }

    modal.innerHTML = `
      <div class="reviews-modal-box">
        <div class="reviews-modal-header">
          <div class="rmh-info">
            <h3>Avaliações</h3>
            <span class="rmh-book-title">${escapeHTML(book.shortTitle || book.title)}</span>
            ${reviews.length ? `<div class="rmh-avg">${renderStarsDisplay(avg)} <span>${avg.toFixed(1)} de 5</span> · ${reviews.length} avaliação${reviews.length !== 1 ? 'ões' : ''}</div>` : ''}
          </div>
          <button class="reviews-modal-close" id="rm-close" aria-label="Fechar">✕</button>
        </div>
        <div class="reviews-modal-body">
          ${formHTML}
          <div class="reviews-history">
            <h4 class="reviews-history-title">Histórico de Avaliações</h4>
            <div id="rm-history-list">${historyHTML}</div>
          </div>
        </div>
      </div>`;

    /* ---- Bind: fechar ---- */
    document.getElementById('rm-close').addEventListener('click', closeReviewsModal);

    /* ---- Bind: logout ---- */
    const logoutBtn = document.getElementById('rm-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { clearSession(); selectedStars = 0; renderReviewsModal(modal, book); });

    /* ---- Bind: toggle login/register ---- */
    const toRegister = document.getElementById('rm-to-register');
    if (toRegister) toRegister.addEventListener('click', () => { authPanel = 'register'; renderReviewsModal(modal, book); });
    const toLogin = document.getElementById('rm-to-login');
    if (toLogin) toLogin.addEventListener('click', () => { authPanel = 'login'; renderReviewsModal(modal, book); });

    /* ---- Bind: login ---- */
    const loginBtn = document.getElementById('rm-login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        const email = (document.getElementById('rm-login-email').value || '').trim().toLowerCase();
        const pass = (document.getElementById('rm-login-pass').value || '');
        const errEl = document.getElementById('rm-login-error');
        const accounts = getAccounts();
        if (!email || !pass) { showAuthError(errEl, 'Preencha e-mail e senha.'); return; }
        if (!accounts[email]) { showAuthError(errEl, 'E-mail não encontrado. Crie uma conta.'); return; }
        if (accounts[email].passHash !== hashStr(pass)) { showAuthError(errEl, 'Senha incorreta.'); return; }
        setSession({ name: accounts[email].name, email });
        selectedStars = 0;
        renderReviewsModal(modal, book);
      });
      bindEnterKey('rm-login-pass', loginBtn);
    }

    /* ---- Bind: register ---- */
    const regBtn = document.getElementById('rm-reg-btn');
    if (regBtn) {
      regBtn.addEventListener('click', () => {
        const name = (document.getElementById('rm-reg-name').value || '').trim();
        const email = (document.getElementById('rm-reg-email').value || '').trim().toLowerCase();
        const pass = (document.getElementById('rm-reg-pass').value || '');
        const errEl = document.getElementById('rm-reg-error');
        if (!name) { showAuthError(errEl, 'Informe seu nome.'); return; }
        if (!email || !email.includes('@')) { showAuthError(errEl, 'Informe um e-mail válido.'); return; }
        if (pass.length < 6) { showAuthError(errEl, 'A senha deve ter pelo menos 6 caracteres.'); return; }
        const accounts = getAccounts();
        if (accounts[email]) { showAuthError(errEl, 'Este e-mail já está cadastrado. Faça login.'); return; }
        accounts[email] = { name, passHash: hashStr(pass) };
        saveAccounts(accounts);
        setSession({ name, email });
        selectedStars = 0;
        renderReviewsModal(modal, book);
      });
      bindEnterKey('rm-reg-pass', regBtn);
    }

    /* ---- Stars picker ---- */
    const picker = document.getElementById('rm-stars-picker');
    const starsLabel = document.getElementById('rm-stars-label');
    const labels = ['', '⭐ Ruim', '⭐⭐ Regular', '⭐⭐⭐ Bom', '⭐⭐⭐⭐ Ótimo', '⭐⭐⭐⭐⭐ Excelente!'];
    if (picker) {
      const starBtns = picker.querySelectorAll('.star-pick');
      function updateStarPicker(n) {
        selectedStars = n;
        starBtns.forEach(b => b.classList.toggle('selected', parseInt(b.dataset.star) <= n));
        if (starsLabel) { starsLabel.style.color = ''; starsLabel.textContent = n ? labels[n] : 'Clique para avaliar'; }
      }
      starBtns.forEach(b => {
        b.addEventListener('click', () => updateStarPicker(parseInt(b.dataset.star)));
        b.addEventListener('mouseenter', () => starBtns.forEach(sb => sb.classList.toggle('hovered', parseInt(sb.dataset.star) <= parseInt(b.dataset.star))));
        b.addEventListener('mouseleave', () => starBtns.forEach(sb => sb.classList.remove('hovered')));
      });
    }

    /* ---- Char counter ---- */
    const textarea = document.getElementById('rm-text');
    const charCount = document.getElementById('rm-char-count');
    if (textarea && charCount) textarea.addEventListener('input', () => { charCount.textContent = textarea.value.length; });

    /* ---- Submit review ---- */
    const submitBtn = document.getElementById('rm-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (!selectedStars) {
          if (starsLabel) { starsLabel.style.color = '#c0392b'; starsLabel.textContent = '⚠️ Selecione pelo menos uma estrela'; }
          return;
        }
        const cur = getSession();
        if (!cur) return;
        const text = textarea ? textarea.value.trim() : '';
        const now = new Date();
        upsertReview(book.id, cur.email, {
          name: cur.name, email: cur.email, stars: selectedStars, text,
          date: now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
          ts: now.toISOString()
        });
        selectedStars = 0;
        refreshBookStrip(book.id);
        renderReviewsModal(modal, book);
      });
    }

    /* ---- Delete review (só o próprio) ---- */
    document.querySelectorAll('.btn-delete-review').forEach(btn => {
      btn.addEventListener('click', () => {
        const cur = getSession();
        if (!cur || cur.email !== btn.dataset.email) return;
        if (!confirm('Tem certeza que deseja excluir sua avaliação?')) return;
        deleteReview(book.id, cur.email);
        refreshBookStrip(book.id);
        renderReviewsModal(modal, book);
      });
    });
  }

  function showAuthError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
  }

  function bindEnterKey(inputId, btn) {
    const el = document.getElementById(inputId);
    if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Fechar modais com Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('reviews-modal');
      const tModal = document.getElementById('team-modal');
      const pModal = document.getElementById('personality-modal');
      if (modal && !modal.hidden && modal.classList.contains('is-open')) {
        closeReviewsModal();
      } else if (tModal && !tModal.hidden) {
        closeTeamModal();
      } else if (pModal && !pModal.hidden) {
        closePersonalityModal();
      } else if (bookZoomView && !bookZoomView.hidden) {
        closeBook();
      }
    }
  });


  // ---------- Efeito Tilt 3D nos Livros ----------
  function applyBookTilt() {
    document.querySelectorAll('.book-card').forEach(card => {
      const wrap = card.querySelector('.book-cover-wrap');
      if (!wrap) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateY = ((x - cx) / cx) * 12;
        const rotateX = -((y - cy) / cy) * 8;
        wrap.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
      });

      card.addEventListener('mouseleave', () => {
        wrap.style.transform = '';
      });
    });
  }

  // ---------- Animação Fade-Up com IntersectionObserver ----------
  function observeFadeUps(root) {
    const targets = (root || document).querySelectorAll('.fade-up');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    targets.forEach(el => observer.observe(el));
  }

  // Aplicar fade-up nos elementos do painel Início
  document.querySelectorAll('.fade-up').forEach(el => observeFadeUps(el.parentElement));
  observeFadeUps(document);

  // ---------- Dados das Personalidades ----------
  const erasData = [
    { id: 'all', emoji: '🌟', label: 'Todas as Épocas' },
    { id: 'colonial-imperio', emoji: '⚔️', label: 'Colônia & Império' },
    { id: 'republica', emoji: '🗳️', label: 'República & Sufrágio' },
    { id: 'ditadura', emoji: '🛡️', label: 'Ditadura & Resistência' },
    { id: 'redemocratizacao', emoji: '🏛️', label: 'Constituinte & Redemocratização' }
  ];

  const personalidadesData = [
    {
      id: 'zumbi',
      name: 'Zumbi dos Palmares',
      years: 'c. 1655 — 1695',
      era: 'colonial-imperio',
      eraTag: '⚔️ Resistência Colonial',
      role: 'Líder da resistência do Quilombo dos Palmares',
      img: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Ant%C3%B4nio_Parreiras_-_Zumbi_2.jpg',
      imgPosition: 'top',
      desc: 'Nascido por volta de 1655 dentro do Quilombo dos Palmares, na Serra da Barriga (atual Alagoas), Zumbi era neto da princesa Aqualtune e sobrinho de Ganga Zumba. Tornou-se o principal comandante militar da resistência, recusando qualquer acordo que garantisse liberdade apenas a quem tivesse nascido livre, mantendo escravizados os demais. Assumiu a liderança de Palmares por volta de 1680 e resistiu a sucessivas expedições coloniais até a destruição do quilombo, em 1694. Capturado e morto em 20 de novembro de 1695, tornou-se o maior símbolo brasileiro da luta por liberdade e autodeterminação — valores que, séculos depois, sustentam a própria ideia de cidadania democrática.',
      videoUrl: 'https://www.youtube.com/watch?v=xOPXXxmFHqw',
      videoLabel: 'Vídeo sobre Zumbi dos Palmares'
    },
    {
      id: 'jose-bonifacio',
      name: 'José Bonifácio de Andrada e Silva',
      years: '1763 — 1838',
      era: 'colonial-imperio',
      eraTag: '📜 Independência & Império',
      role: 'Patriarca da Independência',
      img: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Jose_bonifacio_de_andrada_e_silva_%28cropped%29.jpg',
      imgPosition: 'center',
      desc: 'Patriarca da Independência do Brasil, foi muito além de um articulador político. Como naturalista e pensador, ele já defendia no início do século XIX a abolição gradual da escravidão, a preservação das florestas e a integração dos povos indígenas. Suas ideias de uma nação unificada e estruturada lançaram bases importantes para o debate sobre os direitos civis e o desenvolvimento do país.',
      videoUrl: 'https://www.youtube.com/watch?v=9K842fteB84',
      videoLabel: 'Vídeo sobre José Bonifácio'
    },
    {
      id: 'luiz-gama',
      name: 'Luís Gama',
      years: '1830 — 1882',
      era: 'colonial-imperio',
      eraTag: '⚖️ Abolicionismo & Império',
      role: 'Advogado, jornalista e abolicionista',
      img: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Luiz_Gama.jpg',
      imgPosition: 'center',
      desc: 'Nascido livre, mas vendido como escravo pelo próprio pai, Luís Gama conquistou sua liberdade e tornou-se um dos maiores heróis da luta abolicionista. Autodidata, atuou como advogado (rábula) e utilizou as brechas da lei para libertar centenas de pessoas escravizadas nos tribunais. Ele enfrentou o sistema escravocrata de frente, provando que a lei poderia ser um instrumento de justiça social e defesa intransigente da liberdade.',
      videoUrl: 'https://www.youtube.com/watch?v=-_KZs0pe0TY',
      videoLabel: 'Vídeo sobre Luís Gama'
    },
    {
      id: 'joaquim-nabuco',
      name: 'Joaquim Nabuco',
      years: '1849 — 1910',
      era: 'colonial-imperio',
      eraTag: '📜 Abolicionismo & Império',
      role: 'Líder abolicionista',
      img: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Joaquim_Nabuco_-_1902.jpg',
      imgPosition: 'center',
      desc: 'Diplomata, político e um dos mais expressivos intelectuais brasileiros, Nabuco foi a principal voz política do movimento abolicionista. Em sua obra "O Abolicionismo", ele argumentou que a verdadeira democracia e o progresso nacional jamais seriam possíveis enquanto houvesse trabalho escravo, sendo a abolição o primeiro passo obrigatório para a construção de uma cidadania real e igualitária no Brasil.',
      videoUrl: 'https://www.youtube.com/watch?v=fSsjQIxQ3k8',
      videoLabel: 'Vídeo sobre Joaquim Nabuco'
    },
    {
      id: 'rui-barbosa',
      name: 'Rui Barbosa',
      years: '1849 — 1923',
      era: 'republica',
      eraTag: '🏛️ Primeira República',
      role: 'Jurista, redator da Constituição de 1891',
      img: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Ruy_Barbosa_1907.jpg',
      imgPosition: 'center',
      desc: 'Nascido em Salvador em 1849, Rui Barbosa formou-se em Direito e tornou-se um dos maiores juristas e oradores da história brasileira. Foi um dos principais redatores da primeira Constituição republicana, em 1891, na qual introduziu o habeas corpus como garantia constitucional. Em 1907, na Conferência de Paz de Haia, ganhou o apelido de "Águia de Haia" ao defender a igualdade jurídica entre nações grandes e pequenas.',
      videoUrl: 'https://www.youtube.com/watch?v=sqUe76rn1OU',
      videoLabel: 'Vídeo sobre Rui Barbosa'
    },
    {
      id: 'bertha-lutz',
      name: 'Bertha Lutz',
      years: '1894 — 1976',
      era: 'republica',
      eraTag: '🗳️ Voto Feminino & República',
      role: 'Liderança do movimento pelo voto feminino',
      img: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Bertha_Lutz_1925.jpg',
      imgPosition: 'center',
      desc: 'Bióloga formada na Sorbonne, Bertha Lutz voltou ao Brasil em 1918 já influenciada pelo movimento sufragista europeu. Em 1922, fundou a Federação Brasileira pelo Progresso Feminino e passou a liderar, em todo o país, a campanha pelo direito de voto das mulheres. A conquista veio em 1932, com o Código Eleitoral, incorporada à Constituição de 1934.',
      videoUrl: 'https://www.youtube.com/watch?v=UYLcCT5h9-Q',
      videoLabel: 'Vídeo sobre Bertha Lutz'
    },
    {
      id: 'prestes',
      name: 'Luís Carlos Prestes',
      years: '1898 — 1990',
      era: 'republica',
      eraTag: '✊ Lutas Sociais & República',
      role: 'Líder revolucionário e político',
      img: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Bundesarchiv_Bild_183-69234-0003%2C_Luis_Carlos_Prestes.jpg',
      imgPosition: 'center',
      desc: 'Conhecido como o "Cavaleiro da Esperança", Prestes foi um líder revolucionário que comandou a famosa Coluna Prestes na década de 1920, marchando pelo interior do Brasil para denunciar os abusos da República Velha. Mais tarde, tornou-se a figura central do Partido Comunista Brasileiro (PCB). Sua trajetória de mobilização popular e resistência marca profundamente a história das lutas por transformação política e social no Brasil.',
      videoUrl: 'https://www.youtube.com/watch?v=aKkCysZb0V0',
      videoLabel: 'Vídeo sobre Luís Carlos Prestes'
    },
    {
      id: 'sobral-pinto',
      name: 'Heráclito Sobral Pinto',
      years: '1893 — 1991',
      era: 'ditadura',
      eraTag: '🛡️ Direitos Humanos & Ditadura',
      role: 'Jurista e defensor dos direitos humanos',
      img: 'https://upload.wikimedia.org/wikipedia/pt/8/80/Sobral_Pinto.jpg',
      imgPosition: 'center',
      desc: 'Símbolo da ética e da coragem na advocacia brasileira, Sobral Pinto foi um ferrenho defensor dos direitos humanos durante o Estado Novo e a Ditadura Militar de 1964. Famoso por defender comunistas como Luís Carlos Prestes (apesar de ser profundamente católico), ele chegou a invocar a Lei de Proteção aos Animais para garantir a integridade física de presos políticos torturados.',
      videoUrl: 'https://www.youtube.com/watch?v=h0u3q0VJ354',
      videoLabel: 'Vídeo sobre Sobral Pinto'
    },
    {
      id: 'brizola',
      name: 'Leonel Brizola',
      years: '1922 — 2004',
      era: 'ditadura',
      eraTag: '📢 Legalidade & Educação',
      role: 'Liderança política',
      img: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Brizola.jpg',
      imgPosition: 'center',
      desc: 'Uma das figuras políticas mais carismáticas e influentes do Brasil no século XX. Brizola liderou a "Campanha da Legalidade" em 1961, mobilizando o país para garantir a posse de João Goulart após a renúncia de Jânio Quadros, evitando um golpe militar imediato. No Rio de Janeiro, implementou os famosos CIEPs, defendendo a educação pública em tempo integral como alicerce fundamental para a democracia.',
      videoUrl: 'https://www.youtube.com/watch?v=DPhSupZeiog',
      videoLabel: 'Vídeo sobre Leonel Brizola'
    },
    {
      id: 'dom-paulo',
      name: 'Dom Paulo Evaristo Arns',
      years: '1921 — 2016',
      era: 'ditadura',
      eraTag: '✝️ Memória & Direitos Humanos',
      role: 'Cardeal e voz da resistência',
      img: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Paulo_Evaristo_Arns_%281982%29.jpg',
      imgPosition: 'center',
      desc: 'Como Arcebispo de São Paulo, Dom Paulo foi uma das figuras mais ativas na defesa dos direitos humanos durante a ditadura militar. Ele transformou a Igreja Católica em um refúgio para perseguidos políticos, denunciou torturas e desaparecimentos, e esteve à frente do projeto "Brasil: Nunca Mais", que documentou secretamente as atrocidades cometidas pelo Estado.',
      videoUrl: 'https://www.youtube.com/watch?v=3bWv54ecQ8A',
      videoLabel: 'Vídeo sobre Dom Paulo'
    },
    {
      id: 'chico-mendes',
      name: 'Chico Mendes',
      years: '1944 — 1988',
      era: 'ditadura',
      eraTag: '🌿 Ambientalismo & Direitos Rurais',
      role: 'Líder sindical e ambientalista',
      img: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Chico_Mendes_in_1988_%28cropped%29.jpg',
      imgPosition: 'center',
      desc: 'Seringueiro, líder sindical e ativista, Chico Mendes inovou ao unir a luta pelos direitos dos trabalhadores rurais com a defesa do meio ambiente. Ele organizou os "empates" — manifestações pacíficas em que os seringueiros formavam cordões humanos para impedir o desmatamento da floresta amazônica. Seu legado de ecologia atrelada à justiça social tornou-se um marco irreversível para a cidadania e o desenvolvimento sustentável.',
      videoUrl: 'https://www.youtube.com/watch?v=2hmDsCSbUtE',
      videoLabel: 'Vídeo sobre Chico Mendes'
    },
    {
      id: 'tancredo',
      name: 'Tancredo Neves',
      years: '1910 — 1985',
      era: 'redemocratizacao',
      eraTag: '🏛️ Redemocratização',
      role: 'Primeiro presidente civil eleito após a ditadura',
      img: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Retrato_oficial_do_presidente_do_Brasil%2C_Tancredo_Neves.jpg',
      imgPosition: 'center',
      desc: 'Advogado mineiro nascido em 1910, Tancredo Neves construiu uma longa carreira política. Em 15 de janeiro de 1985, foi eleito presidente da República pelo Colégio Eleitoral — ainda uma eleição indireta, mas que encerrava 21 anos de regime militar. Não chegou a tomar posse: internado às vésperas da cerimônia, morreu em 21 de abril de 1985. Tornou-se, mesmo sem governar, símbolo da travessia entre a ditadura e a democracia.',
      videoUrl: 'https://www.youtube.com/watch?v=QLKQ4mC-Uyc',
      videoLabel: 'Vídeo sobre Tancredo Neves'
    },
    {
      id: 'ulysses',
      name: 'Ulysses Guimarães',
      years: '1916 — 1992',
      era: 'redemocratizacao',
      eraTag: '📜 Constituição de 1988',
      role: '"Senhor Diretas", presidente da Constituinte de 1988',
      img: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Ulysses_nas_Diretas_J%C3%A1.jpg',
      imgPosition: 'center',
      desc: 'Advogado paulista nascido em 1916, Ulysses Guimarães presidiu o MDB e foi um dos rostos mais conhecidos da campanha Diretas Já (1983-1984), o que lhe valeu o apelido de "Senhor Diretas". Como presidente da Câmara dos Deputados, assumiu também a presidência da Assembleia Nacional Constituinte de 1987-1988, conduzindo os trabalhos que resultaram na Constituição Cidadã promulgada em 5 de outubro de 1988.',
      videoUrl: 'https://www.youtube.com/watch?v=X4SvPryt3Ys',
      videoLabel: 'Vídeo sobre Ulysses Guimarães'
    },
    {
      id: 'fhc',
      name: 'Fernando Henrique Cardoso',
      years: '1931 — Hoje',
      era: 'redemocratizacao',
      eraTag: '🏛️ Democracia Contemporânea',
      role: 'Presidente da República e sociólogo',
      img: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Fernando_Henrique_Cardoso_%281999%29.jpg',
      imgPosition: 'center',
      desc: 'Sociólogo de renome internacional e político, FHC foi um dos principais intelectuais críticos ao regime militar, o que lhe rendeu o exílio. Como presidente da República (1995-2002), seu governo consolidou instituições democráticas fundamentais e marcou a maturidade institucional do país no período pós-1988.',
      videoUrl: 'https://www.youtube.com/watch?v=rjQrXkqceb4',
      videoLabel: 'Vídeo sobre FHC'
    },
    {
      id: 'ailton-krenak',
      name: 'Ailton Krenak',
      years: '1953 — Hoje',
      era: 'redemocratizacao',
      eraTag: '🪶 Direitos Indígenas & Constituinte',
      role: 'Líder indígena, ambientalista e escritor',
      img: 'https://www.socioambiental.org/sites/default/files/styles/large/public/2023-05/RS107475_fof_005-scr.jpg?itok=tVgf_a1Y',
      imgPosition: 'center',
      desc: 'Ailton Krenak teve um papel histórico e decisivo na Assembleia Nacional Constituinte de 1987. Em um discurso marcante, pintou o rosto de preto com pasta de jenipapo em sinal de luto pelo retrocesso dos direitos indígenas. Sua mobilização garantiu a aprovação dos artigos na Constituição de 1988 que asseguram os direitos originais dos povos indígenas às suas terras. É uma das vozes mais importantes na defesa do meio ambiente e da pluralidade democrática no Brasil.',
      videoUrl: 'https://youtu.be/PSuFZ8y1OwE?si=7C3T7GIWdTH3JePA',
      videoLabel: 'Vídeo sobre Ailton Krenak'
    }
  ];

  // ---------- Gerenciamento Organizado de Personalidades ----------
  const carousel = document.getElementById('personalities-carousel');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  let activeEraId = 'all';
  let currentPersonalityQuery = '';

  function filterAndRenderPersonalities() {
    if (!carousel) return;
    carousel.innerHTML = '';

    const q = currentPersonalityQuery.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let filtered = personalidadesData;

    if (q !== '') {
      filtered = personalidadesData.filter(p => {
        const name = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const role = (p.role || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const desc = (p.desc || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const eraTag = (p.eraTag || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return name.includes(q) || role.includes(q) || desc.includes(q) || eraTag.includes(q);
      });
    } else if (activeEraId !== 'all') {
      filtered = personalidadesData.filter(p => p.era === activeEraId);
    }

    if (!filtered.length) {
      carousel.innerHTML = '<p class="no-personalities-msg">Nenhuma personalidade encontrada nesta busca.</p>';
      if (dotsContainer) dotsContainer.innerHTML = '';
      return;
    }

    filtered.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'personality-card fade-up';
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');
      card.dataset.index = i;
      card.innerHTML = `
        <span class="personality-era-badge">${p.eraTag}</span>
        <div class="figure-portrait">
          <img src="${p.img}" alt="${p.name}"
            style="width:100%;height:100%;object-fit:cover;object-position:${p.imgPosition || 'center'};border-radius:50%;position:absolute;inset:0;">
        </div>
        <span class="figure-years">${p.years}</span>
        <h3>${p.name}</h3>
        <span class="figure-role">${p.role}</span>
        <button class="btn-read" type="button" data-personality-id="${p.id}" aria-label="Conhecer ${p.name}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          Conhecer
        </button>`;
      carousel.appendChild(card);
    });

    // Gerar dots de paginação
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      filtered.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Ir para personalidade ${i + 1}`);
        dot.dataset.index = i;
        dot.addEventListener('click', () => scrollToCard(i));
        dotsContainer.appendChild(dot);
      });
    }

    // Eventos nos cards
    carousel.querySelectorAll('.personality-card').forEach(card => {
      const btn = card.querySelector('[data-personality-id]');
      if (btn) {
        btn.addEventListener('click', () => openPersonalityModal(btn.dataset.personalityId));
      }
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = card.querySelector('[data-personality-id]')?.dataset?.personalityId;
          if (id) openPersonalityModal(id);
        }
      });
    });

    requestAnimationFrame(() => {
      carousel.querySelectorAll('.fade-up').forEach(el => el.classList.add('is-visible'));
    });
  }

  function setupPersonalityControls() {
    // Configura botões de época (eras)
    const eraNav = document.getElementById('personality-era-nav');
    if (eraNav && !eraNav.children.length) {
      erasData.forEach(era => {
        const btn = document.createElement('button');
        btn.className = 'era-tab' + (era.id === 'all' ? ' active' : '');
        btn.dataset.eraId = era.id;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', era.id === 'all' ? 'true' : 'false');
        btn.innerHTML = `<span class="era-emoji">${era.emoji}</span><span class="era-label">${era.label}</span>`;
        btn.addEventListener('click', () => switchEra(era.id));
        eraNav.appendChild(btn);
      });
    }

    // Configura alternância de visualização (Grade vs Carrossel)
    const stage = document.getElementById('personality-stage');
    const viewGridBtn = document.getElementById('p-view-grid');
    const viewCarouselBtn = document.getElementById('p-view-carousel');

    if (viewGridBtn && viewCarouselBtn && stage) {
      viewGridBtn.addEventListener('click', () => {
        stage.classList.remove('carousel-mode');
        stage.classList.add('grid-mode');
        viewGridBtn.classList.add('active');
        viewCarouselBtn.classList.remove('active');
      });

      viewCarouselBtn.addEventListener('click', () => {
        stage.classList.remove('grid-mode');
        stage.classList.add('carousel-mode');
        viewCarouselBtn.classList.add('active');
        viewGridBtn.classList.remove('active');
      });
    }

    // Configura busca por nome/papel
    const input = document.getElementById('personality-search-input');
    const btn = document.getElementById('personality-search-btn');
    const clearBtn = document.getElementById('personality-search-clear');

    if (input) {
      function executeSearch() {
        currentPersonalityQuery = input.value;
        if (clearBtn) clearBtn.style.display = input.value ? 'block' : 'none';
        filterAndRenderPersonalities();
      }

      input.addEventListener('input', executeSearch);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeSearch();
        }
      });

      if (btn) btn.addEventListener('click', executeSearch);

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          input.value = '';
          currentPersonalityQuery = '';
          clearBtn.style.display = 'none';
          filterAndRenderPersonalities();
          input.focus();
        });
      }
    }
  }

  function switchEra(eraId) {
    activeEraId = eraId;
    document.querySelectorAll('.era-tab').forEach(btn => {
      const on = btn.dataset.eraId === eraId;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    const input = document.getElementById('personality-search-input');
    const clearBtn = document.getElementById('personality-search-clear');
    if (input && input.value !== '') {
      input.value = '';
      currentPersonalityQuery = '';
      if (clearBtn) clearBtn.style.display = 'none';
    }

    filterAndRenderPersonalities();
  }

  function renderPersonalitiesCarousel() {
    setupPersonalityControls();
    filterAndRenderPersonalities();

    if (carousel) {
      carousel.addEventListener('scroll', updateDots, { passive: true });
    }
  }

  function getCardWidth() {
    const firstCard = carousel.querySelector('.personality-card');
    if (!firstCard) return 0;
    const style = window.getComputedStyle(firstCard);
    const gap = parseFloat(window.getComputedStyle(carousel).gap) || 24;
    return firstCard.offsetWidth + gap;
  }

  function scrollToCard(index) {
    const cardW = getCardWidth();
    carousel.scrollTo({ left: cardW * index, behavior: 'smooth' });
    updateDots(index);
  }

  function updateDots(indexOrEvent) {
    if (!dotsContainer) return;
    let activeIndex;
    if (typeof indexOrEvent === 'number') {
      activeIndex = indexOrEvent;
    } else {
      const cardW = getCardWidth();
      activeIndex = Math.round(carousel.scrollLeft / (cardW || 1));
    }
    dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  if (prevBtn && carousel) {
    prevBtn.addEventListener('click', () => {
      const cardW = getCardWidth();
      const current = Math.round(carousel.scrollLeft / (cardW || 1));
      scrollToCard(Math.max(0, current - 1));
    });
  }
  if (nextBtn && carousel) {
    nextBtn.addEventListener('click', () => {
      const cardW = getCardWidth();
      const current = Math.round(carousel.scrollLeft / (cardW || 1));
      scrollToCard(Math.min(personalidadesData.length - 1, current + 1));
    });
  }

  renderPersonalitiesCarousel();

  // ---------- Modal de Personalidade ----------
  const personalityModal = document.getElementById('personality-modal');
  const modalCloseBtn = document.getElementById('personality-modal-close');
  const modalPortrait = document.getElementById('modal-portrait');
  const modalName = document.getElementById('modal-name');
  const modalYears = document.getElementById('modal-years');
  const modalRole = document.getElementById('modal-role');
  const modalDesc = document.getElementById('modal-desc');
  const modalVideoLink = document.getElementById('modal-video-link');

  function openPersonalityModal(id) {
    const p = personalidadesData.find(x => x.id === id);
    if (!p || !personalityModal) return;

    modalPortrait.innerHTML = `<img src="${p.img}" alt="${p.name}"
      style="width:100%;height:100%;object-fit:cover;object-position:${p.imgPosition || 'center'};border-radius:50%;position:absolute;inset:0;">`;

    modalName.textContent = p.name;
    modalYears.textContent = p.years;
    modalRole.textContent = p.role;
    modalDesc.textContent = p.desc;
    modalVideoLink.href = p.videoUrl;
    modalVideoLink.querySelector('svg').nextSibling
      ? (modalVideoLink.lastChild.textContent = ' ' + p.videoLabel)
      : null;

    personalityModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => modalCloseBtn && modalCloseBtn.focus(), 50);
  }

  function closePersonalityModal() {
    if (!personalityModal) return;
    personalityModal.hidden = true;
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closePersonalityModal);
  if (personalityModal) {
    personalityModal.addEventListener('click', e => {
      if (e.target === personalityModal) closePersonalityModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && personalityModal && !personalityModal.hidden) {
      closePersonalityModal();
    }
  });

  // ---------- Ferramentas (Modo Escuro e Feedback) ----------
  const btnFeedback = document.getElementById('btn-feedback');
  const modalFeedback = document.getElementById('modal-feedback');
  const closeBtns = document.querySelectorAll('.close-btn');

  function closeAllModals() {
    if (modalFeedback) modalFeedback.hidden = true;
  }

  if (btnFeedback && modalFeedback) {
    btnFeedback.addEventListener('click', (e) => {
      const isHidden = modalFeedback.hidden;
      closeAllModals();
      modalFeedback.hidden = !isHidden;
      if (!modalFeedback.hidden) {
        renderFeedbackModal();
      }
      e.stopPropagation();
    });
  }

  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tool-modal') && !e.target.closest('.tool-btn')) {
      closeAllModals();
    }
  });

  // Modo Escuro
  const darkModeToggle = document.getElementById('dark-mode-toggle');

  if (darkModeToggle) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // =========================================================
  // PERFIL DE ACESSIBILIDADE — TAMANHO DE FONTE
  // =========================================================
  const fontSizeNormalBtn = document.getElementById('font-size-normal');
  const fontSizeLargeBtn = document.getElementById('font-size-large');
  const fontSizeXLargeBtn = document.getElementById('font-size-xlarge');

  const fontSizeLevels = [
    { id: 'font-size-normal', value: null, btn: fontSizeNormalBtn },
    { id: 'font-size-large', value: 'large', btn: fontSizeLargeBtn },
    { id: 'font-size-xlarge', value: 'xlarge', btn: fontSizeXLargeBtn },
  ];

  function applyFontSize(value) {
    if (value) {
      document.documentElement.setAttribute('data-font-size', value);
    } else {
      document.documentElement.removeAttribute('data-font-size');
    }
    fontSizeLevels.forEach(level => {
      if (!level.btn) return;
      const active = level.value === value;
      level.btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    localStorage.setItem('fontSizeLevel', value || '');
  }

  // Restaura preferência salva
  const savedFontSize = localStorage.getItem('fontSizeLevel') || '';
  applyFontSize(savedFontSize || null);

  fontSizeLevels.forEach(level => {
    if (!level.btn) return;
    level.btn.addEventListener('click', () => applyFontSize(level.value));
  });

  // (VLibras widget sempre ativo — carregado via script no HTML)

  // =========================================================
  // ABA FILMES — dados, renderização e modal
  // =========================================================
  const filmsData = [
    {
      id: 'ainda-estou-aqui',
      title: 'Ainda Estou Aqui',
      year: '2024', type: 'Filme', director: 'Walter Salles',
      synopsis: 'Baseado no livro homônimo de Marcelo Rubens Paiva, o filme narra a história real de Eunice Paiva e seus cinco filhos após o desaparecimento de Rubens Paiva, ex-deputado federal preso e assassinado pela ditadura militar em 1971. Eunice, que nunca soube oficialmente o que aconteceu com o marido, transformou sua dor em luta: tornou-se advogada e defensora dos direitos indígenas. A obra é uma homenagem à resistência silenciosa das famílias que viveram sob o peso da repressão e esperaram décadas por uma verdade que o Estado tardou em reconhecer.',
      demo: 'Mostra as consequências concretas da ausência de liberdade: o Estado que desaparece com cidadãos, nega informações às famílias e impede que a verdade seja conhecida — práticas incompatíveis com qualquer democracia.',
      tags: ['Ditadura', 'Memória', 'Direitos Humanos', 'Resistência'],
      cover: { bg: 'linear-gradient(160deg,#0d1b35 0%,#1e3f6e 100%)', icon: '' },
      coverImg: 'capas/filmes/ainda-estou-aqui.jpg'
    },
    {
      id: 'o-que-e-isso',
      title: 'O Que É Isso, Companheiro?',
      year: '1997', type: 'Filme', director: 'Bruno Barreto',
      synopsis: 'Baseado no livro de Fernando Gabeira, o filme reconstrói o sequestro do embaixador norte-americano Charles Burke Elbrick, em 1969, realizado pela organização revolucionária MR-8. Os jovens militantes exigem a libertação de 15 presos políticos em troca do diplomata. Indicado ao Oscar de Melhor Filme Estrangeiro, a obra não heroiciza nem condena seus personagens: mostra a complexidade humana de quem escolheu a resistência armada num contexto em que todas as saídas democráticas haviam sido fechadas pela ditadura.',
      demo: 'Coloca em questão os limites da resistência política quando a democracia é suprimida — e os dilemas éticos de quem se opõe a um Estado que tortura e mata.',
      tags: ['Ditadura', 'Resistência', 'Violência Política', 'Sequestro'],
      cover: { bg: 'linear-gradient(160deg,#3d0000 0%,#8b0000 100%)', icon: '' },
      coverImg: 'capas/filmes/o-que-e-isso.jpg'
    },
    {
      id: 'marighella',
      title: 'Marighella',
      year: '2019', type: 'Filme', director: 'Wagner Moura',
      synopsis: 'Primeira direção de Wagner Moura, o filme acompanha os últimos anos de vida de Carlos Marighella, escritor, poeta e líder comunista que se tornou o principal símbolo da resistência armada à ditadura militar brasileira. Perseguido pelo então delegado Sérgio Fleury e pelos órgãos de repressão do Estado, Marighella fundou a ALN e foi morto em uma emboscada em São Paulo, em 1969. O longa mostra a brutalidade da máquina repressiva e os dilemas de quem escolheu lutar pela democracia com as armas que a ditadura deixou disponíveis.',
      demo: 'Evidencia a violência sistemática praticada pelo Estado autoritário contra aqueles que se opunham ao regime — e as consequências de viver sem liberdade de expressão ou de organização política.',
      tags: ['Ditadura', 'Resistência Armada', 'Repressão', 'Guerrilha'],
      cover: { bg: 'linear-gradient(160deg,#0a2211 0%,#1a5c2e 100%)', icon: '' },
      coverImg: 'capas/filmes/marighella.jpg'
    },
    {
      id: 'o-dia-21-anos',
      title: 'O Dia que Durou 21 Anos',
      year: '2012', type: 'Documentário', director: 'Camilo Tavares',
      synopsis: 'Usando documentos desclassificados da CIA e do Departamento de Estado norte-americano, o documentário revela como o governo dos Estados Unidos acompanhou, apoiou e incentivou o golpe de 1964 que derrubou João Goulart e instaurou a ditadura militar no Brasil. O título refere-se aos 21 anos de regime autoritário que se seguiram. A obra é fundamental para compreender como interesses geopolíticos externos contribuíram para o fim de um governo democraticamente eleito.',
      demo: 'Mostra que a democracia brasileira foi interrompida não apenas por forças internas, mas com apoio estrangeiro — revelando como o jogo de poder internacional pode comprometer a soberania democrática de um país.',
      tags: ['Golpe de 1964', 'EUA', 'Geopolítica', 'Democracia'],
      cover: { bg: 'linear-gradient(160deg,#1a0f00 0%,#5c3d00 100%)', icon: '' },
      coverImg: 'capas/filmes/o-dia-21-anos.jpg'
    },
    {
      id: 'cabra-marcado',
      title: 'Cabra Marcado para Morrer',
      year: '1984', type: 'Documentário', director: 'Eduardo Coutinho',
      synopsis: 'Iniciado em 1964 como uma ficção sobre João Pedro Teixeira — líder das Ligas Camponesas assassinado em 1962 — o filme foi interrompido pelo golpe militar e retomado 17 anos depois. Coutinho reencontra a viúva, Elizabeth Teixeira, e seus filhos espalhados pelo Brasil, muitos vivendo sob identidades falsas para escapar da repressão. O resultado é uma das obras mais importantes do cinema brasileiro: um documento vivo de como a ditadura destruiu famílias e silenciou movimentos sociais por décadas.',
      demo: 'Demonstra como a repressão política não atingiu apenas militantes urbanos, mas também trabalhadores rurais que lutavam por direitos básicos — revelando a abrangência e crueldade do regime autoritário.',
      tags: ['Ditadura', 'Memória', 'Camponeses', 'Violência'],
      cover: { bg: 'linear-gradient(160deg,#2a1a00 0%,#7a4e00 100%)', icon: '' },
      coverImg: 'capas/filmes/cabra-marcado.jpg'
    },
    {
      id: 'terra-em-transe',
      title: 'Terra em Transe',
      year: '1967', type: 'Filme', director: 'Glauber Rocha',
      synopsis: 'Clássico do Cinema Novo, o filme narra a crise política de Eldorado, país fictício que representa a América Latina. O jornalista e poeta Paulo Martins se vê preso entre um líder populista corrupto e um político conservador apoiado pelas elites, sem encontrar saída honesta em nenhum dos lados. Filmado às margens da censura, apenas três anos após o golpe de 1964, a obra de Glauber Rocha é uma crítica feroz ao populismo, à cumplicidade das elites com o autoritarismo e à passividade política do povo.',
      demo: 'Uma das análises cinematográficas mais profundas já feitas sobre os dilemas da política brasileira: como o populismo, o oportunismo das elites e a falta de consciência política abrem espaço para regimes autoritários.',
      tags: ['Populismo', 'Autoritarismo', 'Poder', 'Cinema Novo'],
      cover: { bg: 'linear-gradient(160deg,#1a0033 0%,#4a0099 100%)', icon: '' },
      coverImg: 'capas/filmes/terra-em-transe.jpg'
    },
    {
      id: 'pra-frente-brasil',
      title: 'Pra Frente, Brasil',
      year: '1982', type: 'Filme', director: 'Roberto Farias',
      synopsis: 'Em 1970, enquanto o Brasil vive a euforia da Copa do Mundo conquistada pelo escrete de Pelé, Jofre, um homem comum sem qualquer militância política, é confundido com um guerrilheiro e sequestrado por agentes da repressão. O filme alterna entre as celebrações nacionais e as sessões de tortura nas quais Jofre está preso, denunciando o contraste entre a propaganda ufanista do regime e a violência praticada nos porões do Estado. Foi censurado à época de seu lançamento.',
      demo: 'Revela a hipocrisia de regimes autoritários que usam o futebol e o patriotismo para esconder a violência sistemática praticada contra cidadãos comuns — muitas vezes sem qualquer prova de crime.',
      tags: ['Ditadura', 'Tortura', 'Repressão', 'Copa de 1970'],
      cover: { bg: 'linear-gradient(160deg,#001a33 0%,#004d1a 100%)', icon: '' },
      coverImg: 'capas/filmes/pra-frente-brasil.jpg'
    },
    {
      id: 'batismo-de-sangue',
      title: 'Batismo de Sangue',
      year: '2006', type: 'Filme', director: 'Helvécio Ratton',
      synopsis: 'Baseado no livro homônimo do frei Betto, o filme narra a história dos frades dominicanos que, por convicção moral e religiosa, ajudaram organizações de resistência à ditadura, incluindo Carlos Marighella. Quando a repressão fecha o cerco, frei Tito é preso e submetido a sessões brutais de tortura, enquanto os demais frades são mantidos em cárcere e pressionados a delatar companheiros. A obra é um retrato doloroso sobre fé, consciência e os limites do que o ser humano pode suportar.',
      demo: 'Mostra que a repressão da ditadura não respeitou nem mesmo religiosos — e que a defesa dos direitos humanos exige coragem em qualquer contexto de autoritarismo.',
      tags: ['Ditadura', 'Tortura', 'Religião', 'Resistência'],
      cover: { bg: 'linear-gradient(160deg,#2d0000 0%,#800020 100%)', icon: '' },
      coverImg: 'capas/filmes/batismo-de-sangue.jpg'
    },
    {
      id: 'o-ano-ferias',
      title: 'O Ano em que Meus Pais Saíram de Férias',
      year: '2006', type: 'Filme', director: 'Cao Hamburger',
      synopsis: 'Em 1970, Mauro, 12 anos, é deixado pelos pais na casa do avô no Bom Retiro, em São Paulo. Seus pais — militantes políticos — precisam fugir da repressão e não podem explicar ao filho o que está acontecendo. Enquanto espera o retorno que tarda, Mauro convive com a comunidade judaica do bairro e vive a Copa do Mundo de olho na televisão. O filme mostra, pelo olhar da infância, como o medo e o silêncio impostos pela ditadura fragmentavam famílias inteiras.',
      demo: 'Humaniza as consequências da ditadura ao mostrá-las pelos olhos de uma criança: o exílio forçado, o silêncio sobre a política e a destruição das relações familiares como efeitos diretos do autoritarismo.',
      tags: ['Ditadura', 'Infância', 'Exílio', 'Copa de 1970'],
      cover: { bg: 'linear-gradient(160deg,#3a1a00 0%,#9c5700 100%)', icon: '' },
      coverImg: 'capas/filmes/o-ano-ferias.jpg'
    },
    {
      id: 'zuzu-angel',
      title: 'Zuzu Angel',
      year: '2006', type: 'Filme', director: 'Sérgio Rezende',
      synopsis: 'A estilista Zuzu Angel era conhecida internacionalmente por seus bordados e suas coleções inspiradas no Brasil. Tudo muda quando seu filho Stuart Angel, militante do MR-8, é preso, torturado e desaparece nas mãos da ditadura em 1971. Recusando-se a aceitar a versão oficial, Zuzu transforma suas coleções em denúncia: cobre seus modelos com anjos, pombas e grades, e percorre o mundo mostrando ao exterior o que o regime tentava esconder. Morreu em um acidente de carro em 1976, em circunstâncias ainda hoje questionadas.',
      demo: 'A trajetória de Zuzu Angel simboliza como o Estado autoritário silencia não apenas militantes, mas também as mães e familiares que ousam pedir explicações — e como a luta pelos direitos humanos exige coragem.',
      tags: ['Ditadura', 'Desaparecimento', 'Resistência', 'Direitos Humanos'],
      cover: { bg: 'linear-gradient(160deg,#001a2d 0%,#004d5e 100%)', icon: '' },
      coverImg: 'capas/filmes/zuzu-angel.jpg'
    },
    {
      id: 'tatuagem',
      title: 'Tatuagem',
      year: '2013', type: 'Filme', director: 'Hilton Lacerda',
      synopsis: 'Recife, anos 1970. O jovem soldado Clécio se apaixona por Fininha, integrante de uma trupe teatral irreverente e provocadora chamada Chão de Estrelas. O grupo desafia abertamente os padrões morais e políticos da ditadura com apresentações que misturam erotismo, crítica social e humor. À medida que a relação dos dois evolui, a repressão se aproxima. O filme celebra a resistência cultural como forma de luta pela liberdade, mostrando que a arte também foi um campo de batalha contra o autoritarismo.',
      demo: 'Evidencia que a ditadura não reprimia apenas atos políticos — também perseguia formas de expressão artística e comportamentos que desafiavam a moral conservadora imposta pelo regime.',
      tags: ['Ditadura', 'Censura', 'Liberdade', 'Arte e Resistência'],
      cover: { bg: 'linear-gradient(160deg,#2d0038 0%,#7a0099 100%)', icon: '' },
      coverImg: 'capas/filmes/tatuagem.jpg'
    },
    {
      id: 'deslembro',
      title: 'Deslembro',
      year: '2018', type: 'Filme', director: 'Flávia Castro',
      synopsis: 'Joana tem 15 anos e voltou ao Brasil depois de crescer no exílio com seus pais, militantes políticos que fugiram da ditadura. Ao tentar se adaptar a Porto Alegre nos anos 1980 — período de abertura política —, ela começa a descobrir pedaços do passado que sua família nunca contou completamente. A adolescência se mistura à História: Joana precisa aprender quem é enquanto descobre o que seus pais viveram. O filme trata das marcas intergeracionais deixadas pela repressão.',
      demo: 'Mostra que as consequências de regimes autoritários não desaparecem com o fim do regime: elas atravessam gerações, moldam identidades e impõem silêncios que podem durar décadas.',
      tags: ['Ditadura', 'Memória', 'Exílio', 'Novas Gerações'],
      cover: { bg: 'linear-gradient(160deg,#0f1c2d 0%,#2d4a6b 100%)', icon: '' },
      coverImg: 'capas/filmes/deslembro.jpg'
    },
    {
      id: 'torre-das-donzelas',
      title: 'Torre das Donzelas',
      year: '2018', type: 'Documentário', director: 'Susanna Lira',
      synopsis: 'Décadas depois de terem sido presas e torturadas na ala feminina do presídio Tiradentes — chamada ironicamente de "Torre das Donzelas" —, sete ex-presas políticas retornam ao mesmo edifício, hoje tombado como patrimônio histórico. Enquanto caminham pelos corredores, relembram as amigas, os momentos de resistência e solidariedade, os sofrimentos e as estratégias de sobrevivência. O documentário é um ato de memória coletiva e um acerto de contas com a História.',
      demo: 'Recupera a experiência específica das mulheres sob a ditadura — alvo de formas particulares de violência e humilhação —, lembrando que a luta pelos direitos humanos tem um rosto feminino fundamental.',
      tags: ['Ditadura', 'Prisão Política', 'Mulheres', 'Memória Coletiva'],
      cover: { bg: 'linear-gradient(160deg,#1a1a1a 0%,#4a4a4a 100%)', icon: '' },
      coverImg: 'capas/filmes/torre-das-donzelas.jpg'
    },
    {
      id: 'verdade-12528',
      title: 'Verdade 12.528',
      year: '2013', type: 'Documentário', director: 'Rodrigo MacNiven',
      synopsis: 'O número 12.528 é o total de casos analisados pela Comissão Nacional da Verdade, criada em 2012 para investigar as graves violações de direitos humanos cometidas pelo Estado brasileiro entre 1946 e 1988. O documentário acompanha o trabalho da comissão, dá voz às vítimas e aos seus familiares e discute a importância da memória e da justiça transicional para uma democracia consolidada. Complementa bem o estudo de qualquer obra sobre o período da ditadura.',
      demo: 'Fundamental para entender que sem memória, verdade e justiça não há democracia plena — e que reconhecer os crimes do passado é uma obrigação do Estado democrático de direito.',
      tags: ['Direitos Humanos', 'Comissão da Verdade', 'Memória', 'Justiça Transicional'],
      cover: { bg: 'linear-gradient(160deg,#0a0a0a 0%,#2d2d2d 100%)', icon: '' },
      coverImg: 'capas/filmes/verdade-12528.jpg'
    },
    {
      id: 'black-tie',
      title: 'Eles Não Usam Black-Tie',
      year: '1981', type: 'Filme', director: 'Leon Hirszman',
      synopsis: 'Adaptação da peça teatral de Gianfrancesco Guarnieri, o filme acompanha uma família operária de São Paulo dividida quando uma greve é deflagrada na fábrica onde trabalham. O pai, Otávio, veterano sindicalista, apoia o movimento. O filho Tião, com medo de perder o emprego e a namorada grávida, decide furar a greve — gerando um conflito que vai além da política e atinge os laços familiares. Lançado durante a abertura política, o filme celebra a organização dos trabalhadores como forma de exercício da cidadania.',
      demo: 'Mostra que a democracia não se resume às eleições: ela se constrói também na capacidade dos trabalhadores de se organizarem, reivindicarem direitos e participarem das decisões que afetam suas vidas.',
      tags: ['Trabalhadores', 'Greve', 'Desigualdade', 'Cidadania'],
      cover: { bg: 'linear-gradient(160deg,#001133 0%,#002d6b 100%)', icon: '' },
      coverImg: 'capas/filmes/black-tie.jpg'
    },
    {
      id: 'que-bom-te-ver-viva',
      title: 'Que Bom Te Ver Viva',
      year: '1989', type: 'Documentário', director: 'Lúcia Murat',
      synopsis: 'A diretora Lúcia Murat, que foi presa política e sobreviveu à tortura durante a ditadura, conduz este documentário perturbador e corajoso. Em formato híbrido, o filme alterna depoimentos reais de oito mulheres que foram torturadas com monólogos ficcionais de uma atriz que reflete sobre o peso de ter sobrevivido quando tantas não sobreviveram. A obra questiona o que significa "vencer" quando o corpo e a memória carregam para sempre as marcas da violência de Estado.',
      demo: 'Mostra as consequências da ausência de liberdade e dos abusos cometidos por um Estado autoritário — e como a violência institucional deixa marcas que não desaparecem com o fim do regime.',
      tags: ['Ditadura', 'Tortura', 'Mulheres', 'Direitos Humanos'],
      cover: { bg: 'linear-gradient(160deg,#1a0033 0%,#5c0044 100%)', icon: '' },
      coverImg: 'https://upload.wikimedia.org/wikipedia/pt/d/d4/Que_Bom_Te_Ver_Viva.jpg'
    },
    {
      id: 'cidadao-boilesen',
      title: 'Cidadão Boilesen',
      year: '2009', type: 'Documentário', director: 'Chaim Litewski',
      synopsis: 'O documentário investiga a trajetória de Henning Albert Boilesen, empresário dinamarquês naturalizado brasileiro que presidiu o Grupo Ultra durante a ditadura. A obra reúne depoimentos e documentos que apontam sua participação no OBAN — Operação Bandeirantes —, organização paraestatal que centralizou as atividades de tortura e assassinato de presos políticos em São Paulo, financiada por empresários. Boilesen foi executado por um grupo guerrilheiro em 1971.',
      demo: 'Ajuda a compreender que regimes autoritários não envolvem apenas militares e governantes: setores da elite econômica e empresarial também participaram ativamente da sustentação da ditadura.',
      tags: ['Ditadura', 'Empresários', 'Tortura', 'Cumplicidade Civil'],
      cover: { bg: 'linear-gradient(160deg,#0d1f0d 0%,#1f4d1f 100%)', icon: '' },
      coverImg: 'capas/filmes/cidadao-boilesen.jpg'
    },
    {
      id: 'o-agente-secreto',
      title: 'O Agente Secreto',
      year: '2025', type: 'Filme', director: 'Kleber Mendonça Filho',
      synopsis: 'Ambientado no Recife durante o período de repressão política, o filme acompanha Marcelo, um homem que retorna à cidade tentando reconstruir sua vida enquanto percebe que está sendo monitorado e perseguido por forças que ele não consegue identificar claramente. A narrativa mistura suspense político e drama íntimo para retratar um período em que a vigilância, o medo e a desconfiança eram ferramentas cotidianas de controle social utilizadas pelo Estado.',
      demo: 'Trabalha temas como perseguição política, liberdade, medo e autoritarismo — e permite relacionar o passado brasileiro com a importância das instituições democráticas na proteção dos cidadãos.',
      tags: ['Ditadura', 'Vigilância', 'Medo', 'Autoritarismo'],
      cover: { bg: 'linear-gradient(160deg,#0a1a0a 0%,#1c3a2a 100%)', icon: '' },
      coverImg: 'https://upload.wikimedia.org/wikipedia/pt/6/60/O_Agente_Secreto_%28Cartaz_brasileiro%29.jpg'
    },
    {
      id: 'paula-subversiva',
      title: 'Paula – A História de uma Subversiva',
      year: '1979', type: 'Filme', director: 'Francisco Ramalho Jr.',
      synopsis: 'Marco Antônio foi um estudante envolvido com movimentos políticos durante a ditadura. Sua companheira Paula também participava da militância e acaba sendo presa, torturada e morta pelos agentes da repressão. Anos depois, já vivendo outra realidade, Marco volta a encontrar pessoas ligadas ao seu passado quando sua filha é sequestrada. O filme mostra como a violência política não encerra seus efeitos com o fim do regime — ela persiste nas vidas das pessoas que sobreviveram.',
      demo: 'Demonstra como a repressão política pode destruir vidas e permanecer influenciando gerações mesmo depois do fim de um regime autoritário.',
      tags: ['Ditadura', 'Tortura', 'Militância', 'Consequências'],
      cover: { bg: 'linear-gradient(160deg,#2a0a0a 0%,#6b1a1a 100%)', icon: '' },
      coverImg: 'capas/filmes/paula-subversiva.jpg'
    },
    {
      id: 'manha-cinzenta',
      title: 'Manhã Cinzenta',
      year: '1969', type: 'Filme', director: 'Olney São Paulo',
      synopsis: 'Num país da América Latina sob domínio autoritário, dois jovens estudantes participam de uma manifestação e são presos. O que se segue são interrogatórios e torturas conduzidos de maneira absurda, burocrática e quase kafkiana, que revelam o funcionamento mecânico e desumano da repressão. O próprio curta sofreu censura e teve cópias confiscadas pela ditadura brasileira. Considerado um clássico da resistência cultural, foi restaurado e redescoberto décadas depois de seu confisco.',
      demo: 'Obra que foi ela própria vítima da censura: as cópias foram apreendidas pela ditadura, tornando-a um documento duplo — tanto sobre a repressão quanto da repressão.',
      tags: ['Ditadura', 'Censura', 'Tortura', 'Resistência Cultural'],
      cover: { bg: 'linear-gradient(160deg,#1a1a2e 0%,#3d3d5e 100%)', icon: '' },
      coverImg: 'https://cinemateca.org.br/wp-content/uploads/2025/09/mv5by2eznwrimwutywu5zc00mdg5lthlzdutody1ytm4zdq4odkxxkeyxkfqcgc-_v1_.jpg'
    },
    {
      id: 'hercules-56',
      title: 'Hércules 56',
      year: '2007', type: 'Documentário', director: 'Silvio Da-Rin',
      synopsis: 'Em setembro de 1969, a ALN e o MR-8 sequestraram o embaixador norte-americano Charles Burke Elbrick, exigindo a libertação de 15 presos políticos — que foram enviados ao México a bordo de um avião cujo código de voo era Hércules 56. Décadas depois, o documentário reúne os próprios participantes da operação, que revisitam suas decisões, seus ideais, as contradições e as consequências do ato. A obra não romantiza nem condena, mas abre espaço para uma reflexão profunda sobre resistência.',
      demo: 'Permite discutir os limites e dilemas da resistência política em um contexto no qual as vias democráticas haviam sido fechadas — e o que acontece quando cidadãos enfrentam um Estado que não reconhece seus direitos.',
      tags: ['Ditadura', 'Resistência Armada', 'Sequestro', 'Memória'],
      cover: { bg: 'linear-gradient(160deg,#0a1f3a 0%,#1a4a6e 100%)', icon: '' },
      coverImg: 'https://upload.wikimedia.org/wikipedia/pt/2/20/Hercules_56_poster.jpg'
    },
    {
      id: 'setenta',
      title: 'Setenta',
      year: '2013', type: 'Documentário', director: 'Emilia Silveira',
      synopsis: 'O documentário acompanha militantes políticos que, após serem presos e torturados pela ditadura, foram incluídos em uma lista de presos a serem libertados em troca do sequestro de um diplomata estrangeiro — operação que os enviou ao exílio. Décadas depois, já idosos, eles revisitam suas memórias e refletem sobre suas escolhas, seus companheiros mortos e o significado daqueles anos. É uma obra de memória afetiva e histórica ao mesmo tempo.',
      demo: 'Aborda prisão política, tortura, exílio e resistência como facetas concretas da vida sem democracia — e como essas experiências permanecem moldando as pessoas para sempre.',
      tags: ['Ditadura', 'Exílio', 'Memória', 'Prisão Política'],
      cover: { bg: 'linear-gradient(160deg,#1a1400 0%,#4a3d00 100%)', icon: '' },
      coverImg: 'https://www.papodecinema.com.br/wp-content/uploads/2014/05/20210126-setenta-papo-de-cinema-cartaz-200x300.webp'
    },
    {
      id: 'em-busca-de-iara',
      title: 'Em Busca de Iara',
      year: '2013', type: 'Documentário', director: 'Flávio Frederico',
      synopsis: 'Iara Iavelberg foi militante da VPR, psicóloga e companheira de Carlos Lamarca, e morreu em 1971 em circunstâncias que os documentos oficiais nunca explicaram satisfatoriamente. O documentário reúne fotografias, cartas, depoimentos de familiares e ex-companheiros para reconstruir sua trajetória — e questiona a versão do governo de que ela teria se suicidado durante um cerco policial. A obra é também uma reflexão sobre como a História oficial apaga histórias individuais.',
      demo: 'Trabalha memória, perseguição política, direitos humanos e reconstrução histórica — lembrando que a democracia exige acesso à verdade sobre o passado.',
      tags: ['Ditadura', 'Memória', 'Desaparecimento', 'Direitos Humanos'],
      cover: { bg: 'linear-gradient(160deg,#2a0a2a 0%,#5e1a5e 100%)', icon: '' },
      coverImg: 'capas/filmes/em-busca-de-iara.jpg'
    },
    {
      id: 'galeria-f',
      title: 'Galeria F',
      year: '2017', type: 'Documentário', director: 'Emilia Silveira',
      synopsis: 'A "Galeria F" era o corredor do presídio Tiradentes onde ficavam confinados os presos políticos durante a ditadura militar. O documentário reúne depoimentos de ex-presos — homens e mulheres — que passaram por aquele espaço e reconstroem suas memórias sobre solidariedade, resistência, tortura e a vida cotidiana dentro de uma prisão política. Por meio de seus relatos, a obra reconstitui um capítulo fundamental da história da repressão no Brasil.',
      demo: 'Ajuda a compreender a importância da liberdade política e da participação social ao mostrar, em detalhes humanos, o que acontece quando um Estado priva seus cidadãos dessas liberdades.',
      tags: ['Ditadura', 'Prisão Política', 'Memória', 'Resistência'],
      cover: { bg: 'linear-gradient(160deg,#1a0f0a 0%,#4a2e1a 100%)', icon: '' },
      coverImg: 'https://m.media-amazon.com/images/S/pv-target-images/6db4b70e7499b46215ba0084d640be8862127822598d9dd6aaece0a621581862.jpg'
    },
    {
      id: 'o-mensageiro',
      title: 'O Mensageiro',
      year: '2023', type: 'Filme', director: 'Lúcia Murat',
      synopsis: 'Ambientado durante a ditadura militar brasileira, o filme segue um mensageiro que circula entre pessoas comuns e militantes políticos, carregando informações e materiais que não podem ser rastreados pela repressão. Sua posição intermediária o coloca em risco constante, enquanto as pessoas ao seu redor são afetadas de formas diferentes pela violência e pelo medo do regime. A obra mostra como o autoritarismo invade o cotidiano e transforma até os vínculos mais simples em terreno de desconfiança.',
      demo: 'Permite discutir autoritarismo, repressão e as consequências sociais de períodos sem liberdade política — e como a ausência de democracia afeta não apenas militantes, mas pessoas comuns.',
      tags: ['Ditadura', 'Cotidiano', 'Medo', 'Autoritarismo'],
      cover: { bg: 'linear-gradient(160deg,#0a1a0a 0%,#253b25 100%)', icon: '' },
      coverImg: 'https://www.papodecinema.com.br/wp-content/uploads/2024/07/20240716-o-mensageiro-papo-de-cinema-cartaz-204x300.webp'
    }
  ];

  const filmZoomView = document.getElementById('film-zoom-view');
  const filmZoomBack = document.getElementById('film-zoom-back');
  const filmZoomPoster = document.getElementById('film-zoom-poster');
  const filmZoomInfo = document.getElementById('film-zoom-info');

  function openFilm(id) {
    const film = filmsData.find(f => f.id === id);
    if (!film || !filmZoomView) return;

    if (filmZoomPoster) {
      filmZoomPoster.innerHTML = film.coverImg
        ? `<div class="film-detail-poster film-detail-poster--img" style="background:${film.cover.bg};">
             <img src="${film.coverImg}" alt="Cartaz de ${film.title}" class="film-detail-poster-img" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'; this.parentElement.classList.remove('film-detail-poster--img');">
             <span class="film-detail-icon">${film.cover.icon}</span>
             <span class="film-detail-title-poster">${film.title}</span>
             <span class="film-year-badge">${film.year}</span>
           </div>`
        : `<div class="film-detail-poster" style="background:${film.cover.bg};">
             <span class="film-detail-icon">${film.cover.icon}</span>
             <span class="film-detail-title-poster">${film.title}</span>
             <span class="film-detail-year">${film.year}</span>
           </div>`;
    }

    if (filmZoomInfo) {
      const tags = film.tags.map(t => `<span class="film-tag">${t}</span>`).join('');
      const demoBlock = film.demo ? `
        <div class="film-detail-body film-demo-block">
          <h4>📌 Relação com a Democracia</h4>
          <p>${film.demo}</p>
        </div>` : '';
      filmZoomInfo.innerHTML = `
        <div class="film-detail-eyebrow">
          <span class="eyebrow">${film.type} · ${film.year}</span>
          <span class="film-director">Dir. ${film.director}</span>
        </div>
        <h2 class="film-detail-title">${film.title}</h2>
        <div class="film-tags">${tags}</div>
        <div class="film-detail-body">
          <h4>Sinopse</h4>
          <p>${film.synopsis}</p>
        </div>
        ${demoBlock}
        ${buildReviewSummaryHTML(film.id)}
        <button class="btn-reviews" id="open-film-reviews-btn" aria-label="Ver e adicionar avaliações">
          💬 Avaliações
        </button>`;
    }

    filmZoomView.hidden = false;
    document.body.style.overflow = 'hidden';
    filmZoomView.scrollTop = 0;
    if (filmZoomBack) setTimeout(() => filmZoomBack.focus(), 50);
    const openReviewsBtn = document.getElementById('open-film-reviews-btn');
    if (openReviewsBtn) {
      openReviewsBtn.addEventListener('click', () => openReviewsModal(film));
    }
  }

  function closeFilm() {
    if (!filmZoomView) return;
    filmZoomView.hidden = true;
    document.body.style.overflow = '';
    filmZoomView.scrollTop = 0;
  }

  if (filmZoomBack) filmZoomBack.addEventListener('click', closeFilm);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && filmZoomView && !filmZoomView.hidden) closeFilm();
  });

  /* --- Lógica de Pesquisa de Filmes --- */
  let currentFilmsQuery = '';

  function applyFilmsFilter() {
    const q = currentFilmsQuery.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let filtered = filmsData;

    if (q !== '') {
      filtered = filmsData.filter(f => {
        const title = (f.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const director = (f.director || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return title.includes(q) || director.includes(q);
      });
    }

    renderFilmsGrid(filtered);
  }

  function setupFilmsSearch() {
    const searchInput = document.getElementById('films-search-input');
    const searchBtn = document.getElementById('films-search-btn');
    const clearBtn = document.getElementById('films-search-clear');

    if (!searchInput) return;

    function executeSearch() {
      currentFilmsQuery = searchInput.value;
      if (clearBtn) {
        clearBtn.style.display = searchInput.value ? 'block' : 'none';
      }
      applyFilmsFilter();
    }

    searchInput.addEventListener('input', executeSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch();
      }
    });

    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        executeSearch();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentFilmsQuery = '';
        clearBtn.style.display = 'none';
        applyFilmsFilter();
        searchInput.focus();
      });
    }
  }

  function renderFilmsGrid(filteredFilms = filmsData) {
    const grid = document.getElementById('films-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!filteredFilms.length) {
      grid.innerHTML = '<p class="no-books-msg">Nenhum filme encontrado.</p>';
      return;
    }
    filteredFilms.forEach((film, i) => {
      const btn = document.createElement('button');
      btn.className = 'film-card fade-up';
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('aria-label', film.title + ' (' + film.year + ') — ' + film.type);
      btn.dataset.filmId = film.id;
      btn.style.transitionDelay = Math.min(i * 0.05, 0.65) + 's';
      btn.innerHTML = `
        <div class="film-poster-wrap">
          <div class="film-poster" style="background:${film.cover.bg};">
            <div class="film-poster-top">
              <span class="film-type-chip">${film.type}</span>
            </div>
            ${film.coverImg
          ? `<img src="${film.coverImg}" alt="Cartaz de ${film.title}" class="film-poster-img" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'; this.parentElement.querySelectorAll('.film-poster-icon, .film-poster-title').forEach(el => el.style.display='');">
                 <span class="film-poster-icon" style="display:none">${film.cover.icon}</span>
                 <span class="film-poster-title" style="display:none">${film.title}</span>`
          : `<span class="film-poster-icon">${film.cover.icon}</span>
                 <span class="film-poster-title">${film.title}</span>`
        }
            <span class="film-year-badge">${film.year}</span>
          </div>
        </div>
        <span class="film-card-label">${film.title}</span>`;
      btn.addEventListener('click', () => openFilm(film.id));
      grid.appendChild(btn);
    });
    requestAnimationFrame(() => {
      grid.querySelectorAll('.fade-up').forEach(el => el.classList.add('is-visible'));
    });
  }

  setupFilmsSearch();
  renderFilmsGrid();

  // =========================================================
  // CONFIGURAÇÃO DO EMAILJS
  // =========================================================
  const EMAILJS_PUBLIC_KEY = '8xYeBVvY9JK3l0xpi';
  const EMAILJS_SERVICE_ID = 'service_e4ov1ek';
  const EMAILJS_TEMPLATE_ID = 'template_bhum36j';

  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  // =========================================================
  // SISTEMA DE FEEDBACK COM LOGIN OBRIGATÓRIO
  // =========================================================
  let feedbackAuthPanel = 'login'; // 'login' | 'register'

  function renderFeedbackModal() {
    const container = document.getElementById('feedback-modal-body');
    if (!container) return;

    const session = getSession();

    if (session) {
      container.innerHTML = `
        <div class="review-form-user-bar">
          <span>Conectado como <strong>${escapeHTML(session.name)}</strong> <span class="review-user-email">(${escapeHTML(session.email)})</span></span>
          <button class="btn-logout-review" id="fb-logout" title="Sair da conta">Sair</button>
        </div>
        <form id="feedback-form">
          <textarea id="feedback-text" rows="4" placeholder="O que você achou do projeto? Encontrou algum problema ou tem sugestões?" required></textarea>
          <button type="submit" class="btn-read" id="feedback-submit-btn" style="width:100%;justify-content:center;">Enviar feedback</button>
        </form>
        <div id="feedback-success" hidden style="text-align:center;color:var(--stamp);font-family:'Inter',sans-serif;font-weight:600;padding:0.8rem 0;">
          <p>✅ Obrigado pelo seu feedback!</p>
        </div>`;

      const logoutBtn = document.getElementById('fb-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          clearSession();
          renderFeedbackModal();
        });
      }

      const form = document.getElementById('feedback-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const textField = document.getElementById('feedback-text');
          const submitBtn = document.getElementById('feedback-submit-btn');
          const successEl = document.getElementById('feedback-success');
          const message = textField ? textField.value.trim() : '';
          if (!message) return;

          if (submitBtn) {
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
          }

          try {
            if (typeof emailjs !== 'undefined') {
              await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                from_name: session.name,
                reply_to: session.email,
                message: `${message}\n\n(Enviado por: ${session.name} <${session.email}>)`,
                to_email: 'vlogliterarioFPT@gmail.com',
              });
            }

            if (form) form.style.display = 'none';
            if (successEl) successEl.hidden = false;

            setTimeout(() => {
              closeAllModals();
              renderFeedbackModal();
            }, 3000);
          } catch (err) {
            console.error('Erro ao enviar feedback:', err);
            if (submitBtn) {
              submitBtn.textContent = 'Erro ao enviar. Tente novamente.';
              submitBtn.disabled = false;
              setTimeout(() => {
                submitBtn.textContent = 'Enviar feedback';
              }, 3000);
            }
          }
        });
      }
    } else if (feedbackAuthPanel === 'register') {
      container.innerHTML = `
        <div class="review-login-area">
          <p class="review-login-prompt">🔐 Crie uma conta para enviar feedback</p>
          <div class="review-auth-form">
            <input type="text" id="fb-reg-name" class="review-login-input" placeholder="Seu nome" maxlength="60" autocomplete="name" />
            <input type="email" id="fb-reg-email" class="review-login-input" placeholder="E-mail" maxlength="100" autocomplete="email" />
            <input type="password" id="fb-reg-pass" class="review-login-input" placeholder="Senha (mín. 6 caracteres)" maxlength="100" autocomplete="new-password" />
            <p class="review-auth-error" id="fb-reg-error" hidden></p>
            <button class="btn-login-review" id="fb-reg-btn">Criar conta</button>
          </div>
          <p class="review-login-note">Já tem conta? <button class="btn-auth-toggle" id="fb-to-login">Entrar</button></p>
        </div>`;

      const toLogin = document.getElementById('fb-to-login');
      if (toLogin) toLogin.addEventListener('click', () => { feedbackAuthPanel = 'login'; renderFeedbackModal(); });

      const regBtn = document.getElementById('fb-reg-btn');
      if (regBtn) {
        regBtn.addEventListener('click', () => {
          const name = (document.getElementById('fb-reg-name').value || '').trim();
          const email = (document.getElementById('fb-reg-email').value || '').trim().toLowerCase();
          const pass = (document.getElementById('fb-reg-pass').value || '');
          const errEl = document.getElementById('fb-reg-error');
          if (!name) { showAuthError(errEl, 'Informe seu nome.'); return; }
          if (!email || !email.includes('@')) { showAuthError(errEl, 'Informe um e-mail válido.'); return; }
          if (pass.length < 6) { showAuthError(errEl, 'A senha deve ter pelo menos 6 caracteres.'); return; }
          const accounts = getAccounts();
          if (accounts[email]) { showAuthError(errEl, 'Este e-mail já está cadastrado. Faça login.'); return; }
          accounts[email] = { name, passHash: hashStr(pass) };
          saveAccounts(accounts);
          setSession({ name, email });
          renderFeedbackModal();
        });
        bindEnterKey('fb-reg-pass', regBtn);
      }
    } else {
      container.innerHTML = `
        <div class="review-login-area">
          <p class="review-login-prompt">🔐 Faça login para enviar feedback</p>
          <div class="review-auth-form">
            <input type="email" id="fb-login-email" class="review-login-input" placeholder="E-mail" maxlength="100" autocomplete="email" />
            <input type="password" id="fb-login-pass" class="review-login-input" placeholder="Senha" maxlength="100" autocomplete="current-password" />
            <p class="review-auth-error" id="fb-login-error" hidden></p>
            <button class="btn-login-review" id="fb-login-btn">Entrar</button>
          </div>
          <p class="review-login-note">Não tem conta? <button class="btn-auth-toggle" id="fb-to-register">Criar conta</button></p>
        </div>`;

      const toRegister = document.getElementById('fb-to-register');
      if (toRegister) toRegister.addEventListener('click', () => { feedbackAuthPanel = 'register'; renderFeedbackModal(); });

      const loginBtn = document.getElementById('fb-login-btn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          const email = (document.getElementById('fb-login-email').value || '').trim().toLowerCase();
          const pass = (document.getElementById('fb-login-pass').value || '');
          const errEl = document.getElementById('fb-login-error');
          const accounts = getAccounts();
          if (!email || !pass) { showAuthError(errEl, 'Preencha e-mail e senha.'); return; }
          if (!accounts[email]) { showAuthError(errEl, 'E-mail não encontrado. Crie uma conta.'); return; }
          if (accounts[email].passHash !== hashStr(pass)) { showAuthError(errEl, 'Senha incorreta.'); return; }
          setSession({ name: accounts[email].name, email });
          renderFeedbackModal();
        });
        bindEnterKey('fb-login-pass', loginBtn);
      }
    }
  }

  // =========================================================
  // MODAL DE EXPANSÃO DA EQUIPE
  // =========================================================
  const teamMembersData = [
    {
      id: 'matheus',
      name: 'Matheus',
      role: 'Desenvolvimento Web & Pesquisa Histórica',
      badge: 'Front-end & Conteúdo',
      img: 'Foto dos integrantes/Matheus-foto.jpeg',
      summary: 'Atuou tanto no desenvolvimento técnico do site quanto no levantamento histórico do projeto. Contribuiu com a programação de funcionalidades, correção de bugs, atualização de links e estruturação do conteúdo histórico da biblioteca e das personalidades.',
      contributions: [
        'Desenvolvimento e manutenção do código front-end do site, incluindo ajustes de layout, funcionalidades e responsividade.',
        'Pesquisa e levantamento dos marcos históricos e personalidades que construíram a democracia brasileira.',
        'Revisão e atualização de links da biblioteca, garantindo que todos os recursos estão acessíveis ao público.'
      ],
      quote: '"Entender o passado e saber construír ferramentas para contar essa história são dois lados da mesma moeda."'
    },
    {
      id: 'laysa',
      name: 'Laysa',
      role: 'Redação e Revisão Textual',
      badge: 'Comunicação & Linguagem',
      img: 'Foto dos integrantes/Laysa-foto.jpeg',
      summary: 'Responsável pela curadoria textual, redação dos ensaios e revisão rigorosa de todo o conteúdo para garantir clareza, correção e impacto comunicativo.',
      contributions: [
        'Redação e padronização dos textos do projeto, aproximando a linguagem científica do público escolar e geral.',
        'Revisão gramatical, ortográfica e conceitual de todas as biografias, resenhas e seções do site.',
        'Estruturação dos textos de introdução e síntese reflexiva sobre a cidadania brasileira.'
      ],
      quote: '“A clareza das palavras é uma ferramenta essencial para tornar o conhecimento democrático e acessível a todos.”'
    },
    {
      id: 'sophia',
      name: 'Sophia',
      role: 'Design e Desenvolvimento Web',
      badge: 'Interface & Front-end',
      img: 'Foto dos integrantes/Sophia-foto.jpeg',
      summary: 'Responsável pela identidade visual, arquitetura de informação e desenvolvimento das interações do site, unindo história e tecnologia.',
      contributions: [
        'Concepção visual do projeto com estética editorial clássica inspirada em arquivos e documentos históricos.',
        'Desenvolvimento da estante de livros 3D, carrossel de personalidades, filtros dinâmicos e sistema de avaliações.',
        'Otimização de responsividade para celulares, tablets e computadores, com suporte completo ao modo escuro.'
      ],
      quote: '“O design transforma dados históricos em uma experiência viva, instigante e memorável.”'
    },
    {
      id: 'louise',
      name: 'Louise',
      role: 'Curadoria da Biblioteca',
      badge: 'Acervo & Obras',
      img: 'Foto dos integrantes/Louise-foto.jpeg',
      summary: 'Responsável pelo mapeamento bibliográfico, curadoria crítica das obras literárias e seleção de títulos com acesso livre para a comunidade.',
      contributions: [
        'Seleção criteriosa dos livros fundamentais para compreender o pensamento político e social brasileiro.',
        'Pesquisa e catalogação de links oficiais em domínio público e bibliotecas digitais abertas.',
        'Organização da biblioteca por categorias temáticas e redação das sinopses analíticas.'
      ],
      quote: '“Garantir o acesso livre e gratuito aos livros é democratizar o próprio direito de pensar e questionar.”'
    },
    {
      id: 'guilherme',
      name: 'Guilherme',
      role: 'Curadoria Audiovisual & Mídias',
      badge: 'Front-end & Audiovisual',
      img: 'Foto dos integrantes/Guilherme-foto.jpeg',
      summary: 'Participou ativamente do desenvolvimento tecnico do site e da curadoria audiovisual. Ajudou na implementacao de recursos interativos, na selecao de videos historicos e na integracao do conteudo multimidia das personalidades.',
      contributions: [
        'Desenvolvimento e teste de componentes interativos do site, colaborando na resolucao de problemas tecnicos e na melhoria da experiencia do usuario.',
        'Mapeamento e selecao de videos, entrevistas e registros historicos das personalidades retratadas no projeto.',
        'Curadoria em acervos publicos de emissoras educativas, arquivos parlamentares e plataformas digitais.'
      ],
      quote: '"Construir um site sobre democracia e, em si, um ato democratico: cada linha de codigo e um convite a participacao."'
    },
    {
      id: 'cecilia',
      name: 'Cecília',
      role: 'Design, Vídeo & Divulgação',
      badge: 'Criação & Comunicação',
      img: 'Foto dos integrantes/image.png',
      summary: 'Auxiliou na produção visual e comunicativa do projeto, contribuindo com design gráfico, produção de vídeos e divulgação do trabalho nas redes sociais e eventos do Ceará Científico.',
      contributions: [
        'Apoio na criação de peças visuais e materiais de divulgação do projeto para redes sociais e apresentações.',
        'Participação na produção e edição de vídeos que integram a seção de personalidades do site.',
        'Divulgação do projeto junto ao público estudantil, ampliando o alcance da pesquisa.'
      ],
      quote: '"A comunicação é o que transforma uma pesquisa em algo que toca as pessoas de verdade."'
    }
  ];

  const teamModal = document.getElementById('team-modal');
  const teamModalClose = document.getElementById('team-modal-close');
  const teamModalImg = document.getElementById('team-modal-img');
  const teamModalName = document.getElementById('team-modal-name');
  const teamModalRole = document.getElementById('team-modal-role');
  const teamModalBadge = document.getElementById('team-modal-badge');
  const teamModalSummary = document.getElementById('team-modal-summary');
  const teamModalContributions = document.getElementById('team-modal-contributions');
  const teamModalQuote = document.getElementById('team-modal-quote');

  function openTeamModal(memberId) {
    const member = teamMembersData.find(m => m.id === memberId);
    if (!member || !teamModal) return;

    if (teamModalImg) {
      teamModalImg.src = member.img;
      teamModalImg.alt = 'Foto de ' + member.name;
    }
    if (teamModalName) teamModalName.textContent = member.name;
    if (teamModalRole) teamModalRole.textContent = member.role;
    if (teamModalBadge) teamModalBadge.textContent = member.badge;
    if (teamModalSummary) teamModalSummary.textContent = member.summary;

    if (teamModalContributions) {
      teamModalContributions.innerHTML = member.contributions
        .map(c => `<li>${c}</li>`)
        .join('');
    }

    if (teamModalQuote) {
      teamModalQuote.textContent = member.quote;
    }

    teamModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => teamModalClose && teamModalClose.focus(), 50);
  }

  function closeTeamModal() {
    if (!teamModal) return;
    teamModal.hidden = true;
    document.body.style.overflow = '';
  }

  if (teamModalClose) teamModalClose.addEventListener('click', closeTeamModal);
  if (teamModal) {
    teamModal.addEventListener('click', (e) => {
      if (e.target === teamModal) closeTeamModal();
    });
  }

  document.querySelectorAll('.team-card').forEach(card => {
    const memberId = card.dataset.member;
    if (!memberId) return;

    card.addEventListener('click', () => openTeamModal(memberId));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTeamModal(memberId);
      }
    });
  });

  // ---------- Animações (Fade-Up) ----------
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

  // ---------- Modo Escuro / Claro ----------
  (function () {
    const root = document.documentElement;
    const toggleBtn = document.getElementById('dark-mode-toggle');

    // Aplica o tema salvo ou o padrão do sistema
    function applyTheme(theme) {
      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-label',
          theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro');
      }
      try { localStorage.setItem('theme', theme); } catch (e) { }
    }

    // Detecta preferência inicial
    let savedTheme = 'light';
    try { savedTheme = localStorage.getItem('theme') || 'light'; } catch (e) { }
    if (savedTheme !== 'dark' && savedTheme !== 'light') savedTheme = 'light';
    applyTheme(savedTheme);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  })();

  // ---------- Controle de Tamanho de Fonte ----------
  (function () {
    const root = document.documentElement;
    const sizes = ['normal', 'large', 'xlarge'];

    function applyFontSize(size) {
      root.setAttribute('data-font-size', size);
      sizes.forEach(s => {
        const btn = document.getElementById('font-size-' + s);
        if (btn) btn.setAttribute('aria-pressed', s === size ? 'true' : 'false');
      });
      try { localStorage.setItem('font-size', size); } catch (e) { }
    }

    let savedSize = 'normal';
    try { savedSize = localStorage.getItem('font-size') || 'normal'; } catch (e) { }
    if (!sizes.includes(savedSize)) savedSize = 'normal';
    applyFontSize(savedSize);

    sizes.forEach(s => {
      const btn = document.getElementById('font-size-' + s);
      if (btn) btn.addEventListener('click', () => applyFontSize(s));
    });
  })();

})();

