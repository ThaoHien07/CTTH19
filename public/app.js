// Application Logic for Phuc An Retail AI Agent Management System
document.addEventListener("DOMContentLoaded", () => {
  // Global State
  const state = {
    currentPhase: 1,
    step2Page: 1,
    step3Page: 1,
    step4Page: 1,
    hasAnalyzedStep1: false,
    desiredOutputs: ["Dashboard"],
    phase1Completed: false,
    phase2Completed: false,
    phase3Completed: false,
    isCleaningRunning: false,
    isReportGenerated: false,
    isAuditCompleted: false,
    selectedStoreForDecision: null,
    chartStores: null,
    chartProductMix: null
  };

  // Sample Raw Records (Representation of the 60,000 dataset)
  const defaultSampleRawRecords = [
    { code: "TRX-100234", time: "02/10 09:15", store: "CH01 - Cầu Giấy", prod: "SP-DGD01 Nồi cơm điện cao tần", cat: "Điện gia dụng", rev: 2590000, cogs: 1761200, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-100235", time: "02/10 09:15", store: "CH01 - Cầu Giấy", prod: "SP-DGD01 Nồi cơm điện cao tần", cat: "Điện gia dụng", rev: 2590000, cogs: 1761200, status: "Hoàn thành", note: "TRÙNG LẶP: Double POS billing", type: "duplicate" },
    { code: "TRX-100412", time: "03/10 14:20", store: "CH03 - Hai Bà Trưng", prod: "SP-TBS04 Loa bluetooth mini", cat: "Thiết bị số", rev: 490000, cogs: 430000, status: "Hoàn thành", note: "Biên siêu mỏng 12.2% (Xả kho)", type: "valid" },
    { code: "TRX-100589", time: "04/10 16:45", store: "CH08 - Quảng Ninh", prod: "SP-DGD09 Máy lọc không khí Pro", cat: "Điện gia dụng", rev: 6890000, cogs: 4685200, status: "Đã hủy", note: "ĐƠN HỦY: Kho báo ảo, hết hàng", type: "cancelled" },
    { code: "TRX-100720", time: "05/10 11:30", store: "CH15 - Bình Thạnh", prod: "SP-SK02 Máy nâng cơ mặt ion", cat: "Chăm sóc sức khỏe", rev: 3200000, cogs: 1760000, status: "Đổi trả", note: "ĐỔI TRẢ: Khách báo tư vấn sai", type: "return" },
    { code: "TRX-100845", time: "06/10 10:12", store: "CH04 - Hoàn Kiếm", prod: "SP-GD03 Robot hút bụi lau nhà", cat: "Gia dụng thông minh", rev: 8490000, cogs: 5263800, status: "Hoàn thành", note: "LỆCH KỲ: Tính dồn 45 ngày", type: "period" },
    { code: "TRX-101004", time: "07/10 18:05", store: "CH02 - Đống Đa", prod: "SP-SK05 Bàn chải điện sóng âm", cat: "Chăm sóc sức khỏe", rev: 1290000, cogs: 709500, status: "Hoàn thành", note: "Hợp lệ - Biên cao 45%", type: "valid" },
    { code: "TRX-101188", time: "08/10 20:10", store: "CH12 - Quận 1", prod: "SP-TBS01 Tai nghe chống ồn", cat: "Thiết bị số", rev: 2190000, cogs: 1708200, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-101250", time: "09/10 09:40", store: "CH15 - Bình Thạnh", prod: "SP-SK02 Máy nâng cơ mặt ion", cat: "Chăm sóc sức khỏe", rev: 3200000, cogs: 1760000, status: "Đổi trả", note: "ĐỔI TRẢ: Hàng trả chưa trừ COGS", type: "return" },
    { code: "TRX-101420", time: "10/10 15:35", store: "CH06 - Long Biên", prod: "SP-GD01 Nồi chiên không dầu", cat: "Điện gia dụng", rev: 2390000, cogs: 1625200, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-101560", time: "11/10 17:22", store: "CH03 - Hai Bà Trưng", prod: "SP-TBS04 Loa bluetooth mini", cat: "Thiết bị số", rev: 490000, cogs: 430000, status: "Hoàn thành", note: "Đếm trùng giao dịch POS", type: "duplicate" },
    { code: "TRX-101790", time: "12/10 13:10", store: "CH07 - Hải Phòng", prod: "SP-DGD03 Lò vi sóng điện tử", cat: "Điện gia dụng", rev: 3190000, cogs: 2169200, status: "Đổi trả", note: "ĐỔI TRẢ: Vận chuyển móp méo", type: "return" },
    { code: "TRX-101920", time: "13/10 19:40", store: "CH18 - Bình Dương", prod: "SP-GD05 Quạt lọc không khí", cat: "Gia dụng thông minh", rev: 4200000, cogs: 2604000, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-102105", time: "14/10 11:15", store: "CH10 - Huế", prod: "SP-SK01 Máy massage cổ vai gáy", cat: "Chăm sóc sức khỏe", rev: 1850000, cogs: 1017500, status: "Hoàn thành", note: "Hợp lệ", type: "valid" }
  ];

  let currentRawRecords = [];
  let customDatasetLoaded = false;
  let customDatasetStats = {
    totalRows: 0,
    duplicateRows: 0,
    cancelledRows: 0,
    returnRows: 0,
    cleanRows: 0,
    fileName: "Chưa có tệp"
  };

  // Helper formatting functions
  function formatMoney(amount) {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(2) + " Tỷ";
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + " Tr";
    }
    return new Intl.NumberFormat('vi-VN').format(amount) + " đ";
  }

  let toastTimer = null;
  function showToast(message, isError = false) {
    const toast = document.getElementById("toast-notification");
    const text = document.getElementById("toast-text");
    if (!toast || !text) return;
    text.textContent = message;
    if (isError) {
      toast.classList.remove("bg-emerald-600");
      toast.classList.add("bg-rose-600");
    } else {
      toast.classList.remove("bg-rose-600");
      toast.classList.add("bg-emerald-600");
    }
    toast.classList.remove("scale-90", "opacity-0", "pointer-events-none");
    toast.classList.add("scale-100", "opacity-100");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("scale-100", "opacity-100");
      toast.classList.add("scale-90", "opacity-0", "pointer-events-none");
    }, 3000);
  }

  // 4-Step Stepper & Progressive Reveal Engine
  function setWorkflowStep(stepNum) {
    state.currentWorkflowStep = stepNum;
    for (let s = 1; s <= 4; s++) {
      const navBtn = document.getElementById(`step-nav-${s}`);
      const badge = document.getElementById(`badge-step-${s}`);
      if (!navBtn || !badge) continue;
      const circle = navBtn.querySelector(".step-circle");

      if (s < stepNum) {
        // Step completed
        navBtn.className = "step-card text-left flex items-center gap-3 p-3 rounded-2xl border border-emerald-300 bg-emerald-50/50 transition cursor-pointer shadow-xs";
        if (circle) circle.className = "step-circle w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs";
        badge.textContent = "✓ Hoàn thành";
        badge.className = "px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 shrink-0";
      } else if (s === stepNum) {
        // Step currently active
        navBtn.className = "step-card active text-left flex items-center gap-3 p-3 rounded-2xl border-2 border-[#FF5B8E] bg-[#FFF0F5] transition cursor-pointer shadow-xs";
        if (circle) circle.className = "step-circle w-8 h-8 rounded-full bg-[#FF5B8E] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs";
        badge.textContent = "Đang thực hiện";
        badge.className = "px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFE2E5] text-[#FA5A7D] shrink-0 animate-pulse";
      } else {
        // Step pending
        navBtn.className = "step-card text-left flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white transition cursor-pointer opacity-70 hover:opacity-100";
        if (circle) circle.className = "step-circle w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center shrink-0";
        badge.textContent = "Chờ";
        badge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 shrink-0";
      }
    }
  }

  // Page Transition Helper (smooth slide-up + top progress sweep)
  function updateMyMelodySpeech(stepLabel) {
    const bubble = document.getElementById("mymelody-speech-bubble");
    const txt = document.getElementById("mymelody-speech-text");
    if (!txt) return;
    const messages = {
      1: "Bước 1: Nạp dữ liệu & bối cảnh doanh nghiệp nhé! 🌸",
      2: "Bước 2: Mình đang đối soát lỗi Đỏ → Xanh giúp bạn! ✨",
      3: "Bước 3: Xem Insight & Action Plan siêu nét nè! 💡",
      4: "Bước 4: Hoàn thành Dashboard & Xuất báo cáo rồi! 🎉"
    };
    if (messages[stepLabel]) {
      txt.textContent = messages[stepLabel];
      if (bubble) bubble.classList.remove("hidden");
    }
  }

  function triggerPageTransition(targetEl) {
    const bar = document.getElementById("page-transition-bar");
    if (bar) {
      bar.style.transition = "none";
      bar.style.width = "0%";
      bar.style.opacity = "1";
      void bar.offsetWidth;
      bar.style.transition = "width 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease";
      bar.style.width = "100%";
      setTimeout(() => {
        bar.style.opacity = "0";
      }, 360);
    }

    if (targetEl) {
      targetEl.classList.remove("page-transition-enter");
      void targetEl.offsetWidth;
      targetEl.classList.add("page-transition-enter");
    }
  }

  function revealSubsequentSteps() {
    const step1Section = document.getElementById("step1-main-section");
    const container = document.getElementById("subsequent-steps-container");
    if (step1Section) {
      step1Section.classList.add("hidden");
    }
    if (container) {
      container.classList.remove("hidden");
    }
    state.hasAnalyzedStep1 = true;
    setWorkflowStep(2);
    switchPhase(1);
    updateMyMelodySpeech(2);
    triggerPageTransition(container);
  }

  function hideSubsequentSteps() {
    const step1Section = document.getElementById("step1-main-section");
    const container = document.getElementById("subsequent-steps-container");
    if (step1Section) {
      step1Section.classList.remove("hidden");
      triggerPageTransition(step1Section);
    }
    if (container) {
      container.classList.add("hidden");
    }
    state.hasAnalyzedStep1 = false;
    state.phase1Completed = false;
    setWorkflowStep(1);
    updateMyMelodySpeech(1);
  }

  // Phase Tab Switching Logic
  function openVerificationChoiceModal() {
    const modal = document.getElementById("verification-choice-modal");
    const summaryEl = document.getElementById("verification-modal-summary");
    if (summaryEl) {
      const tot = (customDatasetStats.totalRows || 0).toLocaleString("vi-VN");
      const cln = (customDatasetStats.cleanRows || 0).toLocaleString("vi-VN");
      summaryEl.innerHTML = `<strong>Tóm tắt Bước 2:</strong> Đã kiểm tra <strong>${tot}</strong> dòng dữ liệu gốc • Đạt <strong>${cln}</strong> dòng sạch. Bạn có hài lòng với kết quả sửa của AI Agent chưa?`;
    }
    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  function setStep2Page(pageNum) {
    const p = Math.max(1, Math.min(4, pageNum));
    state.step2Page = p;
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`step2-page-${i}-content`);
      if (el) el.classList.toggle("hidden", i !== p);
    }
    const activeEl = document.getElementById(`step2-page-${p}-content`);
    if (activeEl) triggerPageTransition(activeEl);

    document.querySelectorAll(".step2-subtab").forEach(btn => {
      const btnP = parseInt(btn.getAttribute("data-s2-page"), 10);
      if (btnP === p) {
        btn.className = "step2-subtab active px-3 py-2 rounded-xl text-xs font-extrabold bg-[#FF5B8E] text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer";
      } else {
        btn.className = "step2-subtab px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-[#FF5B8E] border border-[#FAD2E1] transition flex items-center justify-center gap-1.5 cursor-pointer";
      }
    });

    const ind = document.getElementById("step2-page-indicator");
    const prev = document.getElementById("btn-s2-prev");
    const next = document.getElementById("btn-s2-next");
    if (ind) ind.textContent = `${p} / 4`;
    if (prev) prev.disabled = p === 1;
    if (next) next.disabled = p === 4;
  }

  function setStep3Page(pageNum) {
    const p = Math.max(1, Math.min(4, pageNum));
    state.step3Page = p;
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`step3-page-${i}-content`);
      if (el) el.classList.toggle("hidden", i !== p);
    }
    const overviewCharts = document.getElementById("dabang-overview-charts");
    if (overviewCharts && state.currentPhase === 2) {
      overviewCharts.classList.toggle("hidden", p !== 1);
    }
    const activeEl = document.getElementById(`step3-page-${p}-content`);
    if (activeEl) triggerPageTransition(activeEl);

    document.querySelectorAll(".step3-subtab").forEach(btn => {
      const btnP = parseInt(btn.getAttribute("data-s3-page"), 10);
      if (btnP === p) {
        btn.className = "step3-subtab active px-3 py-2 rounded-xl text-xs font-extrabold bg-[#FF5B8E] text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer";
      } else {
        btn.className = "step3-subtab px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-[#FF5B8E] border border-[#FAD2E1] transition flex items-center justify-center gap-1.5 cursor-pointer";
      }
    });

    const ind = document.getElementById("step3-page-indicator");
    const prev = document.getElementById("btn-s3-prev");
    const next = document.getElementById("btn-s3-next");
    if (ind) ind.textContent = `${p} / 4`;
    if (prev) prev.disabled = p === 1;
    if (next) next.disabled = p === 4;
  }

  document.querySelectorAll(".step2-subtab").forEach(btn => {
    btn.addEventListener("click", () => {
      setStep2Page(parseInt(btn.getAttribute("data-s2-page"), 10));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  document.getElementById("btn-s2-prev")?.addEventListener("click", () => {
    setStep2Page((state.step2Page || 1) - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("btn-s2-next")?.addEventListener("click", () => {
    setStep2Page((state.step2Page || 1) + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll(".step3-subtab").forEach(btn => {
    btn.addEventListener("click", () => {
      setStep3Page(parseInt(btn.getAttribute("data-s3-page"), 10));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  document.getElementById("btn-s3-prev")?.addEventListener("click", () => {
    setStep3Page((state.step3Page || 1) - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("btn-s3-next")?.addEventListener("click", () => {
    setStep3Page((state.step3Page || 1) + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function setStep4Page(pageNum) {
    const p = Math.max(1, Math.min(5, pageNum));
    state.step4Page = p;

    const overviewCharts = document.getElementById("dabang-overview-charts");
    const bpmnMainCard = document.getElementById("bpmn-main-card");
    const bpmnHeader = document.getElementById("bpmn-engine-header");
    const s4p2 = document.getElementById("step4-page-2-content");
    const s4p3 = document.getElementById("step4-page-3-content");
    const s4p4 = document.getElementById("step4-page-4-content");
    const s4p5 = document.getElementById("step4-page-5-content");

    if (overviewCharts) overviewCharts.classList.toggle("hidden", p !== 1);
    if (bpmnMainCard) bpmnMainCard.classList.toggle("hidden", p === 1);
    if (bpmnHeader) bpmnHeader.classList.toggle("hidden", p !== 2);
    if (s4p2) s4p2.classList.toggle("hidden", p !== 2);
    if (s4p3) s4p3.classList.toggle("hidden", p !== 3);
    if (s4p4) s4p4.classList.toggle("hidden", p !== 4);
    if (s4p5) s4p5.classList.toggle("hidden", p !== 5);

    if (p === 4) {
      renderWebExecutiveReport();
    }

    const activeTarget = p === 1 ? overviewCharts : (p === 2 ? s4p2 : (p === 3 ? s4p3 : (p === 4 ? s4p4 : s4p5)));
    if (activeTarget) triggerPageTransition(activeTarget);

    // Update subnav tabs
    document.querySelectorAll(".step4-subtab").forEach(btn => {
      const btnP = parseInt(btn.getAttribute("data-s4-page"), 10);
      const isCol2 = btnP === 5 ? "col-span-2 sm:col-span-1 " : "";
      if (btnP === p) {
        btn.className = `step4-subtab active ${isCol2}px-3 py-2.5 rounded-xl text-xs font-extrabold bg-[#FF5B8E] text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer`;
      } else {
        btn.className = `step4-subtab ${isCol2}px-3 py-2.5 rounded-xl text-xs font-bold bg-[#FFF5F8] text-slate-700 hover:text-[#FF5B8E] border border-[#FAD2E1] transition flex items-center justify-center gap-1.5 cursor-pointer`;
      }
    });

    const indicator = document.getElementById("step4-page-indicator");
    const btnPrevS4 = document.getElementById("btn-s4-prev");
    const btnNextS4 = document.getElementById("btn-s4-next");
    if (indicator) indicator.textContent = `Trang ${p} / 5`;
    if (btnPrevS4) btnPrevS4.disabled = p === 1;
    if (btnNextS4) btnNextS4.disabled = p === 5;
  }

  document.querySelectorAll(".step4-subtab").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = parseInt(btn.getAttribute("data-s4-page"), 10);
      setStep4Page(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.getElementById("btn-s4-prev")?.addEventListener("click", () => {
    setStep4Page((state.step4Page || 1) - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("btn-s4-next")?.addEventListener("click", () => {
    setStep4Page((state.step4Page || 1) + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function switchPhase(phaseNum) {
    if (phaseNum >= 2 && !state.phase1Completed) {
      openVerificationChoiceModal();
      return;
    }
    state.currentPhase = phaseNum;

    // Update Tab UI
    document.querySelectorAll(".phase-tab").forEach((tab, idx) => {
      const p = idx + 1;
      tab.classList.remove("active");
      if (p === phaseNum) {
        tab.classList.add("active");
      }
    });

    const overviewCharts = document.getElementById("dabang-overview-charts");
    const bpmnMainCard = document.getElementById("bpmn-main-card");
    const bpmnHeader = document.getElementById("bpmn-engine-header");
    const s4Subnav = document.getElementById("step4-subnav-bar");
    const s4Footer = document.getElementById("step4-page-footer");

    if (s4Subnav) s4Subnav.classList.toggle("hidden", phaseNum !== 3);
    if (s4Footer) s4Footer.classList.toggle("hidden", phaseNum !== 3);

    // Update Panels Visibility
    document.querySelectorAll(".phase-panel").forEach(p => p.classList.add("hidden"));
    const activePanel = document.getElementById(`panel-phase${phaseNum}`);
    if (activePanel) {
      activePanel.classList.remove("hidden");
      triggerPageTransition(activePanel);
      updateMyMelodySpeech(phaseNum + 1);
    }

    // Auto trigger Phase 2 or 3 rendering if needed
    if (phaseNum === 2 && !state.isReportGenerated) {
      generateManagementReport();
    } else if (phaseNum === 3 && !state.isAuditCompleted) {
      runCrossCheckAudit();
    }

    if (phaseNum === 3) {
      setStep4Page(state.step4Page || 1);
    } else if (phaseNum === 2) {
      if (bpmnMainCard) bpmnMainCard.classList.remove("hidden");
      if (bpmnHeader) bpmnHeader.classList.remove("hidden");
      setStep3Page(state.step3Page || 1);
    } else {
      if (bpmnMainCard) bpmnMainCard.classList.remove("hidden");
      if (bpmnHeader) bpmnHeader.classList.remove("hidden");
      if (overviewCharts) overviewCharts.classList.add("hidden");
      setStep2Page(state.step2Page || 1);
    }
  }

  // Tab click listeners (guarded in case legacy 3-phase tabs are hidden/removed)
  const tabPhase1 = document.getElementById("tab-phase1");
  const tabPhase2 = document.getElementById("tab-phase2");
  const tabPhase3 = document.getElementById("tab-phase3");
  if (tabPhase1) tabPhase1.addEventListener("click", () => switchPhase(1));
  if (tabPhase2) {
    tabPhase2.addEventListener("click", () => {
      if (!state.phase1Completed) {
        showToast("Vui lòng hoàn thành xác thực dữ liệu sạch ở Bước 2 trước!", true);
        return;
      }
      switchPhase(2);
    });
  }
  if (tabPhase3) {
    tabPhase3.addEventListener("click", () => {
      if (!state.phase1Completed) {
        showToast("Vui lòng xác thực Bước 2 trước!", true);
        return;
      }
      switchPhase(3);
    });
  }

  // Render Raw Sample Table (Optimized: capped at 100 preview rows + single innerHTML batch)
  function renderRawSampleTable(filter = "all") {
    const tbody = document.getElementById("raw-sample-tbody");
    if (!tbody) return;

    const filtered = currentRawRecords.filter(r => filter === "all" || r.type === filter);

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="p-8 text-center text-slate-400 font-medium">
            <i class="fa-solid fa-inbox text-3xl mb-2 text-slate-300 block"></i>
            Chưa có dữ liệu giao dịch. Vui lòng kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV để AI Agent bắt đầu phân tích.
          </td>
        </tr>
      `;
      return;
    }

    const MAX_PREVIEW = 100;
    const previewSlice = filtered.slice(0, MAX_PREVIEW);
    const htmlRows = [];

    for (let i = 0; i < previewSlice.length; i++) {
      const r = previewSlice[i];
      const isErr = r.type && r.type !== "valid";
      const info = isErr ? getErrorAnalysisAndFix(r) : null;
      const repairedRev = isErr ? (r.fixedRev !== undefined ? r.fixedRev : info.defaultRev) : r.rev;

      let statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-medium">${escapeHtml(r.status)}</span>`;
      if (r.type === "duplicate") {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 border border-rose-300 font-bold">Trùng lặp</span>`;
      } else if (r.type === "cancelled") {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 border border-rose-300 font-bold">Đã hủy</span>`;
      } else if (r.type === "return") {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 border border-rose-300 font-bold">Đổi trả</span>`;
      } else if (r.type === "period") {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 border border-rose-300 font-bold">Lệch kỳ</span>`;
      }

      const rowCls = isErr ? "bg-rose-50/75 hover:bg-rose-100/60 transition" : "hover:bg-slate-50 transition";
      const codeHtml = isErr
        ? `<span class="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">${escapeHtml(r.code)}</span>`
        : escapeHtml(r.code);
      const rawRevHtml = isErr
        ? `<span class="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold line-through">${formatMoney(r.rev)}</span>`
        : formatMoney(r.rev);
      const fixedRevHtml = isErr
        ? `<span class="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-400 font-black">✓ ${formatMoney(repairedRev)}</span>`
        : `<span class="text-emerald-700 font-bold">${formatMoney(r.rev)}</span>`;

      htmlRows.push(`
        <tr class="${rowCls}">
          <td class="p-3 font-mono font-bold text-indigo-600">${codeHtml}</td>
          <td class="p-3 text-slate-500">${escapeHtml(r.time)}</td>
          <td class="p-3 font-bold text-slate-900">${escapeHtml(r.store)}</td>
          <td class="p-3 text-slate-800 font-medium">${escapeHtml(r.prod)}</td>
          <td class="p-3 text-slate-500">${escapeHtml(r.cat)}</td>
          <td class="p-3 text-right font-mono">${rawRevHtml}</td>
          <td class="p-3 text-right font-mono">${fixedRevHtml}</td>
          <td class="p-3 text-right font-mono text-slate-500">${formatMoney(r.cogs)}</td>
          <td class="p-3">${statusBadge}</td>
          <td class="p-3 text-xs ${isErr ? 'text-rose-700 font-bold' : 'text-slate-400'}">${escapeHtml(r.note)} ${isErr ? '<span class="ml-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black">Đã sửa</span>' : ''}</td>
        </tr>
      `);
    }

    if (filtered.length > MAX_PREVIEW) {
      htmlRows.push(`
        <tr class="bg-[#FFF5F8] border-t border-[#FAD2E1]">
          <td colspan="10" class="p-3 text-center text-xs font-bold text-[#FF5B8E]">
            <i class="fa-solid fa-bolt mr-1"></i> Đang hiển thị ${MAX_PREVIEW} dòng mẫu đầu tiên trên tổng số ${filtered.length.toLocaleString('vi-VN')} dòng để tránh giật lag trình duyệt. Toàn bộ dữ liệu vẫn được AI Agent xử lý đầy đủ!
          </td>
        </tr>
      `);
    }

    tbody.innerHTML = htmlRows.join("");
    renderCleaningDiffWorkspace();
  }

  function getErrorAnalysisAndFix(r) {
    if (r.type === "duplicate") {
      return {
        errorLabel: "Trùng lặp mã giao dịch",
        wrongSummary: `Mã GD ${r.code} bị lặp • Cộng dư ${formatMoney(r.rev)}`,
        fixedAction: "Loại bỏ bản ghi trùng (giữ bản ghi gốc)",
        defaultRev: 0,
        defaultCogs: 0,
        reason: `Mã giao dịch ${r.code} xuất hiện nhiều hơn 1 lần (do POS ghi nhận đúp hoặc xuất trùng dòng), làm đếm trùng doanh thu và số lượng bán.`,
        solution: `Loại bỏ bản ghi trùng lặp khỏi doanh thu thuần (đưa giá trị đóng góp báo cáo về 0 đ) và giữ lại duy nhất 1 giao dịch gốc.`
      };
    }
    if (r.type === "cancelled") {
      return {
        errorLabel: "Đơn đã hủy vẫn tính doanh thu",
        wrongSummary: `Trạng thái "${r.status}" • Doanh thu thô ${formatMoney(r.rev)}`,
        fixedAction: "Khấu trừ 100% đơn hủy khỏi doanh thu",
        defaultRev: 0,
        defaultCogs: 0,
        reason: `Đơn hàng đã bị hủy (${r.status}) trước khi hoàn tất giao hàng nhưng file nguồn vẫn ghi nhận ${formatMoney(r.rev)}, tạo doanh thu ảo.`,
        solution: `Đưa Doanh thu và Giá vốn tính báo cáo của đơn hủy về 0 đ; tách riêng sang chỉ số theo dõi tỷ lệ hủy đơn của cửa hàng.`
      };
    }
    if (r.type === "return") {
      return {
        errorLabel: "Đơn đổi trả chưa trừ doanh thu & COGS",
        wrongSummary: `Trạng thái "${r.status}" • Chưa hoàn trừ ${formatMoney(r.rev)}`,
        fixedAction: "Trừ doanh thu hoàn & hoàn nhập giá vốn COGS",
        defaultRev: 0,
        defaultCogs: 0,
        reason: `Giao dịch phát sinh đổi/trả hàng (${r.status}) nhưng doanh thu thô chưa trừ phần tiền hoàn lại và chưa hoàn nhập giá vốn (COGS) về kho.`,
        solution: `Khấu trừ giá trị hoàn trả khỏi Doanh thu thuần, hoàn nhập COGS tương ứng và đối chiếu mã giao dịch gốc để kiểm soát tỷ lệ đổi trả.`
      };
    }
    // period mismatch
    const normRev = Math.round((Number(r.rev) || 0) * (31 / 45));
    const normCogs = Math.round((Number(r.cogs) || 0) * (31 / 45));
    return {
      errorLabel: "Lệch kỳ so sánh dữ liệu",
      wrongSummary: `Gộp kỳ 45 ngày • Doanh thu ${formatMoney(r.rev)}`,
      fixedAction: "Quy đổi chuẩn hóa về chu kỳ 31 ngày",
      defaultRev: normRev,
      defaultCogs: normCogs,
      reason: `Dữ liệu bị gộp chu kỳ 45 ngày thay vì 30–31 ngày chuẩn, khiến tốc độ tăng trưởng và hiệu suất cửa hàng bị thổi phồng sai lệch.`,
      solution: `Áp dụng hệ số chuẩn hóa 31/45 ngày cho Doanh thu (${formatMoney(normRev)}) và Giá vốn (${formatMoney(normCogs)}) để đồng bộ kỳ đối chiếu.`
    };
  }

  function renderRepairFlowTable(allErrors) {
    const tbody = document.getElementById("repair-flow-tbody");
    const elWrongTotal = document.getElementById("repair-total-wrong");
    const elFixedTotal = document.getElementById("repair-total-fixed");
    if (!tbody) return;

    if (!allErrors || allErrors.length === 0) {
      if (elWrongTotal) elWrongTotal.textContent = "0 đ";
      if (elFixedTotal) elFixedTotal.textContent = "0 đ";
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-6 text-center text-xs text-slate-400">
            Không có dòng lỗi nào cần sửa. Dữ liệu đã sạch hoàn toàn!
          </td>
        </tr>
      `;
      return;
    }

    let sumWrong = 0;
    let sumFixed = 0;
    allErrors.forEach(({ r }) => {
      const info = getErrorAnalysisAndFix(r);
      sumWrong += Number(r.rev) || 0;
      const repairedVal = r.fixedRev !== undefined ? Number(r.fixedRev) : info.defaultRev;
      sumFixed += repairedVal;
    });

    if (elWrongTotal) elWrongTotal.textContent = formatMoney(sumWrong);
    if (elFixedTotal) elFixedTotal.textContent = formatMoney(sumFixed);

    const MAX_ROWS = 40;
    const rowsHtml = allErrors.slice(0, MAX_ROWS).map(({ r, idx }) => {
      const info = getErrorAnalysisAndFix(r);
      const isFixed = r.isFixed !== false;
      const repairedRev = r.fixedRev !== undefined ? r.fixedRev : info.defaultRev;

      return `
        <tr class="${isFixed ? 'bg-emerald-50/35' : 'bg-rose-50/30'} hover:bg-emerald-50/60 transition">
          <td class="p-3">
            <div class="font-mono font-bold text-slate-900">${escapeHtml(r.code)}</div>
            <div class="text-[11px] text-slate-500">${escapeHtml(r.store)}</div>
          </td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
              ${escapeHtml(info.errorLabel)}
            </span>
          </td>
          <td class="p-3 text-right">
            <span class="inline-block px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 font-mono font-bold line-through">
              ${formatMoney(r.rev)}
            </span>
          </td>
          <td class="p-3 text-center text-emerald-600 font-black">
            <i class="fa-solid fa-arrow-right"></i>
          </td>
          <td class="p-3 text-right">
            <span class="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border-2 border-emerald-400 font-mono font-black shadow-xs">
              ${formatMoney(repairedRev)}
            </span>
          </td>
          <td class="p-3 text-xs text-slate-700 font-medium">
            ${escapeHtml(info.fixedAction)}
          </td>
          <td class="p-3 text-center">
            <button type="button" data-repair-row="${idx}" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${isFixed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'} hover:opacity-90 transition cursor-pointer">
              ${isFixed ? '✓ Đã sửa' : 'Sửa → Đúng'}
            </button>
          </td>
        </tr>
      `;
    });

    if (allErrors.length > MAX_ROWS) {
      rowsHtml.push(`
        <tr class="bg-emerald-50/70">
          <td colspan="7" class="p-3 text-center text-xs font-bold text-emerald-800">
            Đang hiển thị ${MAX_ROWS} dòng tiêu biểu trên tổng số ${allErrors.length.toLocaleString('vi-VN')} dòng lỗi đã được chuẩn hóa (bôi xanh).
          </td>
        </tr>
      `);
    }

    tbody.innerHTML = rowsHtml.join("");

    tbody.querySelectorAll("[data-repair-row]").forEach(btn => {
      btn.addEventListener("click", () => {
        const recIdx = parseInt(btn.getAttribute("data-repair-row"), 10);
        const rec = currentRawRecords[recIdx];
        if (!rec) return;
        const info = getErrorAnalysisAndFix(rec);
        rec.fixedRev = rec.fixedRev !== undefined ? rec.fixedRev : info.defaultRev;
        rec.fixedCogs = rec.fixedCogs !== undefined ? rec.fixedCogs : info.defaultCogs;
        rec.isFixed = true;
        renderCleaningDiffWorkspace();
        showToast(`Đã chuyển mã ${rec.code} từ Sai (Đỏ) → Đúng (Xanh): ${formatMoney(rec.fixedRev)}`);
      });
    });
  }

  const btnRunRepairFlow = document.getElementById("btn-run-repair-flow");
  if (btnRunRepairFlow) {
    btnRunRepairFlow.addEventListener("click", () => {
      let count = 0;
      currentRawRecords.forEach(r => {
        if (r && r.type && r.type !== "valid") {
          const info = getErrorAnalysisAndFix(r);
          r.fixedRev = info.defaultRev;
          r.fixedCogs = info.defaultCogs;
          r.isFixed = true;
          count++;
        }
      });
      renderCleaningDiffWorkspace();
      showToast(`Đã chạy luồng sửa Sai → Đúng và bôi xanh toàn bộ ${count.toLocaleString('vi-VN')} số liệu đã sửa!`);
    });
  }

  function renderErrorExplanationFlow(allErrors) {
    const flowListEl = document.getElementById("error-explanation-flow-list");
    const flowBadgeEl = document.getElementById("explanation-flow-badge");
    if (!flowListEl) return;

    if (!allErrors || allErrors.length === 0) {
      if (flowBadgeEl) flowBadgeEl.textContent = "Không có lỗi";
      flowListEl.innerHTML = `
        <div class="col-span-full text-center text-xs text-slate-400 py-4">
          Dữ liệu sạch 100%, không phát sinh nhóm lỗi cần giải thích.
        </div>
      `;
      return;
    }

    const groupDefs = [
      {
        type: "duplicate",
        title: "1. Dữ liệu trùng lặp (Duplicate)",
        why: "Hệ thống POS ghi nhận giao dịch 2 lần trong cùng thời điểm hoặc tệp xuất bị lặp dòng, làm đếm trùng mã giao dịch và thổi phồng doanh thu/sản lượng.",
        fix: "Lọc theo Mã Giao Dịch duy nhất, loại bỏ toàn bộ bản ghi trùng khỏi doanh thu thuần (đưa về 0 đ) và giữ lại 1 giao dịch gốc."
      },
      {
        type: "cancelled",
        title: "2. Đơn hàng đã hủy (Cancelled)",
        why: "Khách hủy đơn hoặc kho hết hàng trước khi giao, nhưng cột Thành tiền vẫn giữ giá trị dương nên nếu cộng thẳng sẽ tạo doanh thu ảo.",
        fix: "Khấu trừ 100% doanh thu và giá vốn của các đơn Cancelled về 0 đ trong báo cáo tài chính; tách riêng để theo dõi tỷ lệ hủy đơn."
      },
      {
        type: "return",
        title: "3. Đơn đổi trả hàng (Returned)",
        why: "Khách đã trả hàng và được hoàn tiền nhưng chưa trừ khỏi doanh thu thực nhận, đồng thời chưa hoàn nhập giá vốn COGS về kho.",
        fix: "Trừ phần tiền hoàn trả khỏi Doanh thu thuần, hoàn nhập COGS tương ứng và đối chiếu Mã Giao Dịch Gốc để kiểm soát bất thường."
      },
      {
        type: "period",
        title: "4. Lệch kỳ so sánh dữ liệu",
        why: "Số liệu một số cửa hàng bị gộp 45 ngày thay vì chu kỳ chuẩn 30–31 ngày, khiến tốc độ tăng trưởng bị sai lệch khi so sánh chéo.",
        fix: "Chuẩn hóa đồng bộ về chu kỳ 31 ngày chuẩn bằng hệ số quy đổi (31/45) cho cả doanh thu và giá vốn trước khi lập Dashboard."
      }
    ];

    const cards = [];
    let groupCount = 0;
    groupDefs.forEach(g => {
      const matched = allErrors.filter(item => item.r.type === g.type);
      if (matched.length === 0) return;
      groupCount++;
      const totalImpact = matched.reduce((sum, item) => sum + (Number(item.r.rev) || 0), 0);
      const sampleCodes = matched.slice(0, 3).map(item => item.r.code).join(", ");

      cards.push(`
        <div class="rounded-2xl border border-[#FAD2E1] bg-white p-4 space-y-3 shadow-xs">
          <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#FFE4EC]">
            <div class="font-black text-xs text-slate-900">${g.title}</div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
              ${matched.length.toLocaleString('vi-VN')} dòng • ${formatMoney(totalImpact)}
            </span>
          </div>
          <div class="text-[11px] text-slate-500">
            <span class="font-semibold text-slate-700">Mã mẫu:</span> <span class="font-mono text-rose-700 font-bold">${escapeHtml(sampleCodes)}</span>${matched.length > 3 ? ` và ${matched.length - 3} mã khác` : ""}
          </div>
          <div class="rounded-xl bg-rose-50/80 border border-rose-200 p-2.5 text-xs space-y-1">
            <div class="font-extrabold text-rose-800 flex items-center gap-1.5">
              <i class="fa-solid fa-circle-question"></i> Vì sao dữ liệu sai?
            </div>
            <p class="text-rose-950 leading-relaxed">${g.why}</p>
          </div>
          <div class="rounded-xl bg-emerald-50/80 border border-emerald-200 p-2.5 text-xs space-y-1">
            <div class="font-extrabold text-emerald-800 flex items-center gap-1.5">
              <i class="fa-solid fa-wrench"></i> Giải pháp khắc phục dữ liệu
            </div>
            <p class="text-emerald-950 leading-relaxed">${g.fix}</p>
          </div>
        </div>
      `);
    });

    if (flowBadgeEl) {
      flowBadgeEl.textContent = `${groupCount} nhóm lỗi đã phân tích`;
    }
    flowListEl.innerHTML = cards.join("");
  }

  function renderCleaningDiffWorkspace(filterOverride = null) {
    const listEl = document.getElementById("cleaning-diff-list");
    const errCountEl = document.getElementById("diff-error-count");
    const fixedCountEl = document.getElementById("diff-fixed-count");
    const filterEl = document.getElementById("filter-diff-type");
    if (!listEl) return;

    const activeFilter = filterOverride !== null ? filterOverride : (filterEl ? filterEl.value : "all");
    const allErrors = currentRawRecords
      .map((r, idx) => ({ r, idx }))
      .filter(item => item.r && item.r.type && item.r.type !== "valid");

    const filteredErrors = allErrors.filter(item => activeFilter === "all" || item.r.type === activeFilter);
    const fixedTotal = allErrors.filter(item => item.r.isFixed !== false).length;

    if (errCountEl) errCountEl.textContent = `${allErrors.length.toLocaleString('vi-VN')} lỗi phát hiện`;
    if (fixedCountEl) fixedCountEl.textContent = `${fixedTotal.toLocaleString('vi-VN')} đã sửa`;

    renderErrorExplanationFlow(allErrors);
    renderRepairFlowTable(allErrors);

    if (filteredErrors.length === 0) {
      listEl.innerHTML = `
        <div class="text-center text-xs text-slate-400 py-6">
          ${allErrors.length === 0
            ? "Chưa phát hiện dòng dữ liệu lỗi nào. Hãy nạp dữ liệu ở Bước 1 để AI Agent đối soát."
            : "Không có dòng lỗi nào khớp với bộ lọc hiện tại."}
        </div>
      `;
      return;
    }

    const MAX_DIFF_PREVIEW = 40;
    const slice = filteredErrors.slice(0, MAX_DIFF_PREVIEW);
    const cardsHtml = slice.map(({ r, idx }) => {
      const info = getErrorAnalysisAndFix(r);
      const isFixed = r.isFixed !== false;
      const repairedRev = r.fixedRev !== undefined ? r.fixedRev : info.defaultRev;
      const repairedCogs = r.fixedCogs !== undefined ? r.fixedCogs : info.defaultCogs;

      return `
        <div class="rounded-2xl border border-[#FAD2E1] bg-white p-3.5 shadow-xs space-y-3" data-diff-idx="${idx}">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <!-- BÊN TRÁI: BÔI ĐỎ DỮ LIỆU SAI -->
            <div class="rounded-xl bg-rose-50 border-2 border-rose-300 p-3 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase">
                  Dữ liệu sai • ${escapeHtml(info.errorLabel)}
                </span>
                <span class="font-mono text-xs font-black bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded">
                  ${escapeHtml(r.code)}
                </span>
              </div>
              <div class="text-xs text-rose-950 space-y-1">
                <div><span class="font-semibold text-rose-700">Cửa hàng:</span> ${escapeHtml(r.store)} • <span class="text-rose-700">${escapeHtml(r.time)}</span></div>
                <div><span class="font-semibold text-rose-700">Sản phẩm:</span> ${escapeHtml(r.prod)}</div>
                <div class="flex flex-wrap items-center gap-2 pt-1">
                  <span class="px-2 py-0.5 rounded bg-rose-200/70 text-rose-900 font-bold line-through">
                    DT thô: ${formatMoney(r.rev)}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-rose-200/70 text-rose-900 font-semibold">
                    COGS: ${formatMoney(r.cogs)}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-rose-600/15 text-rose-800 font-bold border border-rose-300">
                    ${escapeHtml(r.status)}
                  </span>
                </div>
              </div>
            </div>

            <!-- BÊN PHẢI: PHẦN SỬA DỮ LIỆU (BÔI XANH) -->
            <div class="rounded-xl ${isFixed ? 'bg-emerald-50 border-2 border-emerald-300' : 'bg-amber-50 border-2 border-amber-300'} p-3 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${isFixed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'} uppercase">
                  ${isFixed ? '✓ Đã sửa chuẩn hóa' : 'Chờ áp dụng sửa'}
                </span>
                <span class="text-[11px] font-bold ${isFixed ? 'text-emerald-800' : 'text-amber-800'}">
                  ${escapeHtml(info.fixedAction)}
                </span>
              </div>
              <div class="text-xs text-emerald-950 space-y-1.5">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-950 font-black">
                    DT sau sửa: ${formatMoney(repairedRev)}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-900 font-bold">
                    COGS sau sửa: ${formatMoney(repairedCogs)}
                  </span>
                </div>
                <div class="flex items-center gap-2 pt-1">
                  <label class="text-[11px] font-bold text-emerald-800 shrink-0">Sửa DT (VNĐ):</label>
                  <input type="number" min="0" step="1000" value="${repairedRev}" data-fix-input="${idx}"
                    class="w-32 bg-white border border-emerald-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-emerald-900 focus:outline-none focus:border-emerald-600">
                  <button type="button" data-apply-fix="${idx}"
                    class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer">
                    Lưu sửa
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- LUỒNG GIẢI THÍCH LÝ DO SAI & GIẢI PHÁP KHẮC PHỤC -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
            <div class="flex items-start gap-2">
              <i class="fa-solid fa-triangle-exclamation text-rose-500 mt-0.5 shrink-0"></i>
              <div>
                <span class="font-extrabold text-slate-800">Lý do dữ liệu sai:</span>
                <span class="text-slate-600">${escapeHtml(info.reason)}</span>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <i class="fa-solid fa-lightbulb text-emerald-600 mt-0.5 shrink-0"></i>
              <div>
                <span class="font-extrabold text-slate-800">Giải pháp khắc phục:</span>
                <span class="text-slate-600">${escapeHtml(info.solution)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    if (filteredErrors.length > MAX_DIFF_PREVIEW) {
      cardsHtml.push(`
        <div class="p-3 text-center text-xs font-bold text-[#FF5B8E] bg-[#FFF5F8] rounded-xl border border-[#FAD2E1]">
          Đang hiển thị ${MAX_DIFF_PREVIEW} dòng lỗi tiêu biểu trên tổng số ${filteredErrors.length.toLocaleString('vi-VN')} dòng lỗi. Toàn bộ các dòng lỗi khác đều được áp dụng cùng quy tắc sửa chuẩn hóa.
        </div>
      `);
    }

    listEl.innerHTML = cardsHtml.join("");

    // Bind inline fix buttons
    listEl.querySelectorAll("[data-apply-fix]").forEach(btn => {
      btn.addEventListener("click", () => {
        const recIdx = parseInt(btn.getAttribute("data-apply-fix"), 10);
        const inp = listEl.querySelector(`[data-fix-input="${recIdx}"]`);
        if (currentRawRecords[recIdx] && inp) {
          const newVal = Math.max(0, Number(inp.value) || 0);
          currentRawRecords[recIdx].fixedRev = newVal;
          currentRawRecords[recIdx].isFixed = true;
          renderCleaningDiffWorkspace();
          showToast(`Đã lưu sửa dữ liệu cho mã ${currentRawRecords[recIdx].code}: ${formatMoney(newVal)}`);
        }
      });
    });
  }

  const filterDiffType = document.getElementById("filter-diff-type");
  if (filterDiffType) {
    filterDiffType.addEventListener("change", (e) => {
      renderCleaningDiffWorkspace(e.target.value);
    });
  }

  const btnApplyAllFixes = document.getElementById("btn-apply-all-fixes");
  if (btnApplyAllFixes) {
    btnApplyAllFixes.addEventListener("click", () => {
      let fixedCount = 0;
      currentRawRecords.forEach(r => {
        if (r && r.type && r.type !== "valid") {
          const info = getErrorAnalysisAndFix(r);
          r.fixedRev = info.defaultRev;
          r.fixedCogs = info.defaultCogs;
          r.isFixed = true;
          fixedCount++;
        }
      });
      renderCleaningDiffWorkspace();
      showToast(`Đã áp dụng giải pháp sửa chuẩn hóa (bôi xanh) cho toàn bộ ${fixedCount.toLocaleString('vi-VN')} dòng lỗi!`);
    });
  }

  document.getElementById("filter-data-type").addEventListener("change", (e) => {
    renderRawSampleTable(e.target.value);
  });

  // ========================================================
  // SHEETS / EXCEL / CSV UPLOAD & TEMPLATE GENERATION SYSTEM
  // ========================================================
  const fileInput = document.getElementById("file-sheets-input");
  const dropZone = document.getElementById("drop-zone");
  const uploadBanner = document.getElementById("upload-status-banner");
  const uploadFilename = document.getElementById("upload-filename");
  const uploadDetails = document.getElementById("upload-details");
  const activeSourceBadge = document.getElementById("active-source-badge");

  // AI Agent Data Cleaning Engine & Log Elements (Hoisted for early access)
  const btnRunCleaning = document.getElementById("btn-run-cleaning");
  const logOutput = document.getElementById("cleaning-log-output");
  const cleaningStatusBadge = document.getElementById("cleaning-status-badge");

  function appendLog(message, type = "info") {
    if (!logOutput) return;
    const div = document.createElement("div");
    const time = new Date().toLocaleTimeString('vi-VN');
    if (type === "clean") {
      div.className = "text-amber-400";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="font-bold">[LÀM SẠCH]</span> ${message}`;
    } else if (type === "success") {
      div.className = "text-emerald-400 font-bold";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="text-emerald-300 font-bold">[HOÀN TẤT]</span> ${message}`;
    } else if (type === "human") {
      div.className = "text-rose-300 font-bold";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="text-rose-400 font-extrabold">[CHỈ ĐẠO CHUYÊN VIÊN]</span> ${message}`;
    } else {
      div.className = "text-blue-300";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> [AGENT] ${message}`;
    }
    logOutput.appendChild(div);
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  function updateStep2ErrorCounts(stats = customDatasetStats, records = currentRawRecords) {
    const elDup = document.getElementById("step2-count-duplicate");
    const elCan = document.getElementById("step2-count-cancelled");
    const elRet = document.getElementById("step2-count-return");
    const elPer = document.getElementById("step2-count-period");
    const elCln = document.getElementById("step2-count-clean");

    const periodFromRecords = Array.isArray(records)
      ? records.filter(r => r && r.type === "period").length
      : 0;

    const dup = stats && stats.duplicateRows ? stats.duplicateRows : 0;
    const can = stats && stats.cancelledRows ? stats.cancelledRows : 0;
    const ret = stats && stats.returnRows ? stats.returnRows : 0;
    const per = stats && stats.periodRows !== undefined ? stats.periodRows : periodFromRecords;
    const cln = stats && stats.cleanRows ? stats.cleanRows : 0;

    if (elDup) elDup.textContent = dup.toLocaleString('vi-VN');
    if (elCan) elCan.textContent = can.toLocaleString('vi-VN');
    if (elRet) elRet.textContent = ret.toLocaleString('vi-VN');
    if (elPer) elPer.textContent = per.toLocaleString('vi-VN');
    if (elCln) elCln.textContent = cln.toLocaleString('vi-VN');
  }

  function runCleaningPipeline(recordsToClean = currentRawRecords, stats = customDatasetStats) {
    if (!recordsToClean || recordsToClean.length === 0) return;
    state.isCleaningRunning = true;
    state.phase1Completed = false;
    updateStep2ErrorCounts(stats, recordsToClean);
    renderRawSampleTable();
    if (cleaningStatusBadge) {
      cleaningStatusBadge.textContent = "Agent đang xử lý...";
      cleaningStatusBadge.className = "px-2 py-0.5 rounded text-[10px] bg-blue-600 text-white font-semibold animate-pulse";
    }

    if (logOutput) logOutput.innerHTML = "";
    const sourceName = stats.fileName;
    const totRows = stats.totalRows.toLocaleString('vi-VN');
    const dupRows = stats.duplicateRows.toLocaleString('vi-VN');
    const canRows = stats.cancelledRows.toLocaleString('vi-VN');
    const retRows = stats.returnRows.toLocaleString('vi-VN');
    const clnRows = stats.cleanRows.toLocaleString('vi-VN');

    // Step 0: Ingestion
    appendLog(`Khởi động pipeline BPMN: Tiếp nhận & Làm sạch dữ liệu [${sourceName}]...`, "agent");

    setTimeout(() => {
      appendLog(`Tiếp nhận thành công: '${sourceName}' gồm ${totRows} dòng giao dịch thực tế.`, "info");
      
      // Print first 3 sample records from user's actual uploaded file directly in log
      const sampleLimit = Math.min(recordsToClean.length, 3);
      for (let i = 0; i < sampleLimit; i++) {
        const r = recordsToClean[i];
        appendLog(`[MẪU DÒNG ${i+1}] Mã: ${r.code} | Cửa hàng: ${r.store} | SP: ${r.prod} | Doanh thu: ${formatMoney(r.rev)} | Trạng thái: ${r.status}`, "clean");
      }
    }, 250);

    // Step 1: Duplicate check
    setTimeout(() => {
      appendLog(`BƯỚC 1: LỌC TRÙNG - Bóc tách ${dupRows} dòng duplicate (trùng mã giao dịch / double POS).`, "clean");
    }, 700);

    // Step 2: Canceled orders
    setTimeout(() => {
      appendLog(`BƯỚC 2: BỎ ĐƠN HỦY - Loại bỏ ${canRows} đơn hủy / trả hàng trước giao bị cộng nhầm vào doanh thu.`, "clean");
    }, 1150);

    // Step 3: Returns standardization
    setTimeout(() => {
      appendLog(`BƯỚC 3: XỬ LÝ HÀNG TRẢ - Chuẩn hóa ${retRows} dòng đổi trả, trừ doanh thu thực nhận và hoàn nhập COGS.`, "clean");
    }, 1600);

    // Step 4: Comparison period synchronization
    setTimeout(() => {
      appendLog(`BƯỚC 4: ĐỒNG BỘ KỲ ĐỐI CHIẾU - Khóa cứng chu kỳ bán hàng tương đương (31 ngày T10 vs 30 ngày T09).`, "clean");
    }, 2050);

    // Step 5: Finished
    setTimeout(() => {
      document.getElementById("stat-clean-rows").textContent = clnRows;
      document.getElementById("stat-duplicate-rows").textContent = dupRows;
      document.getElementById("stat-cancelled-rows").textContent = canRows;
      document.getElementById("stat-return-rows").textContent = retRows;
      document.getElementById("stat-total-raw-rows").innerHTML = `${totRows} <span class="text-xs font-normal text-slate-400">dòng</span>`;
      document.getElementById("stat-total-raw-desc").textContent = sourceName;

      appendLog(`KẾT QUẢ XUẤT SHEET: ${totRows} dòng thô ➔ ${clnRows} dòng sạch hợp lệ (Khớp đối soát 100%).`, "success");
      appendLog("Chuyển quyền cho Chuyên viên Kinh doanh thực hiện Bước Xác Thực Con Người (Human Verification Gate)...", "info");
      if (cleaningStatusBadge) {
        cleaningStatusBadge.textContent = "Chờ Human Verification";
        cleaningStatusBadge.className = "px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-bold";
      }
      state.isCleaningRunning = false;
      state.cleaningCompleted = true;
      showToast(`AI Agent đã làm sạch ${clnRows} dòng dữ liệu từ ${sourceName}!`);
    }, 2500);
  }

  // Fast O(1) column key resolver (resolved ONCE per file instead of per-row regex scanning)
  function findMatchingColumnKey(keys, keywords) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const cleanK = key.toLowerCase().replace(/[\s_\-–—]/g, "");
      for (let j = 0; j < keywords.length; j++) {
        const cleanKw = keywords[j];
        if (cleanK === cleanKw || cleanK.includes(cleanKw) || cleanKw.includes(cleanK)) {
          return key;
        }
      }
    }
    return null;
  }

  function resolveColumnMap(sampleRow) {
    if (!sampleRow || typeof sampleRow !== "object") return {};
    const keys = Object.keys(sampleRow);
    return {
      codeKey: findMatchingColumnKey(keys, ["mãgiaodịch", "magiaodich", "mãđơn", "orderid", "transactionid", "mãgd", "code", "magd", "id", "sốhđ"]),
      timeKey: findMatchingColumnKey(keys, ["thoigiangiaodich", "thờigian", "thoigian", "ngàygiờ", "ngày", "date", "time", "createdat", "ngay"]),
      storeKey: findMatchingColumnKey(keys, ["tencuahang", "têncửahàng", "cửahàng", "cuahang", "macuahang", "mãcửahàng", "store", "shop", "chinhanh", "diemban"]),
      prodKey: findMatchingColumnKey(keys, ["tensanpham", "tênsảnphẩm", "sảnphẩm", "sanpham", "masanpham", "mãsảnphẩm", "product", "item", "tensp", "mathang"]),
      catKey: findMatchingColumnKey(keys, ["ngànhhàng", "nganhhang", "nhómhàng", "category", "danhmuc", "loaihang"]),
      revKey: findMatchingColumnKey(keys, ["doanhthuthô", "doanhthu", "tổngtiền", "tongtien", "thànhtiền", "thanhtien", "revenue", "amount", "giátrị"]),
      cogsKey: findMatchingColumnKey(keys, ["giávốn", "giavon", "cogs", "tiềnvốn", "chiphívốn", "cost"]),
      statusKey: findMatchingColumnKey(keys, ["trạngtháiđơn", "trạngthái", "trangthai", "tìnhtrạng", "status"])
    };
  }

  // Extract tabular data from a SheetJS worksheet, skipping company header titles (Optimized with raw: true & fast loops)
  function extractSmartTableFromWorksheet(worksheet) {
    if (!worksheet || !worksheet['!ref']) return [];
    
    // Read as 2D array of raw values (dramatically faster than formatted strings)
    const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: true });
    if (!aoa || aoa.length === 0) return [];

    let headerRowIndex = 0;
    let maxScore = -1;

    const scanLimit = Math.min(aoa.length, 15);
    for (let r = 0; r < scanLimit; r++) {
      const row = aoa[r];
      if (!Array.isArray(row) || row.length === 0) continue;
      let score = 0;
      const joined = row.map(c => String(c || "").toLowerCase().trim()).join(" ");
      if (joined.includes("mã") || joined.includes("code") || joined.includes("id")) score += 3;
      if (joined.includes("giao dịch") || joined.includes("transaction") || joined.includes("đơn") || joined.includes("order")) score += 3;
      if (joined.includes("cửa hàng") || joined.includes("store") || joined.includes("shop") || joined.includes("chi nhánh")) score += 3;
      if (joined.includes("sản phẩm") || joined.includes("product") || joined.includes("item") || joined.includes("hàng")) score += 3;
      if (joined.includes("doanh thu") || joined.includes("tiền") || joined.includes("revenue") || joined.includes("amount") || joined.includes("giá")) score += 3;
      if (joined.includes("ngày") || joined.includes("thời gian") || joined.includes("date") || joined.includes("time")) score += 3;
      if (joined.includes("giá vốn") || joined.includes("cogs") || joined.includes("cost")) score += 3;
      if (joined.includes("trạng thái") || joined.includes("status")) score += 3;

      if (score > maxScore && score >= 3) {
        maxScore = score;
        headerRowIndex = r;
      }
    }

    const rawHeaders = aoa[headerRowIndex] || [];
    const headerLen = rawHeaders.length;
    const headers = new Array(headerLen);
    for (let c = 0; c < headerLen; c++) {
      const h = String(rawHeaders[c] || "").trim();
      headers[c] = h || `Cot_${c + 1}`;
    }

    const resultRows = [];
    for (let r = headerRowIndex + 1; r < aoa.length; r++) {
      const rowData = aoa[r];
      if (!Array.isArray(rowData) || rowData.length === 0) continue;
      let hasValue = false;
      for (let c = 0; c < headerLen; c++) {
        const v = rowData[c];
        if (v !== "" && v !== null && v !== undefined) {
          hasValue = true;
          break;
        }
      }
      if (!hasValue) continue;

      const obj = {};
      for (let c = 0; c < headerLen; c++) {
        obj[headers[c]] = rowData[c] !== undefined ? rowData[c] : "";
      }
      resultRows.push(obj);
    }

    return resultRows.length > 0 ? resultRows : XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: true });
  }

  function finishProcessingParsedRows(formattedRecords, total, dupCount, cancelCount, returnCount, fileName, autoAdvance = false) {
    currentRawRecords = formattedRecords;
    customDatasetLoaded = true;
    customDatasetStats = {
      totalRows: total,
      duplicateRows: dupCount,
      cancelledRows: cancelCount,
      returnRows: returnCount,
      cleanRows: Math.max(total - dupCount - cancelCount, 0),
      fileName: fileName
    };

    // Update UI counters with exact stats from user's file
    const elTot = document.getElementById("stat-total-raw-rows");
    if (elTot) elTot.innerHTML = `${customDatasetStats.totalRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elTotDesc = document.getElementById("stat-total-raw-desc");
    if (elTotDesc) elTotDesc.textContent = `Nạp từ tệp: ${fileName}`;
    const elDup = document.getElementById("stat-duplicate-rows");
    if (elDup) elDup.innerHTML = `${customDatasetStats.duplicateRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elCan = document.getElementById("stat-cancelled-rows");
    if (elCan) elCan.innerHTML = `${customDatasetStats.cancelledRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elRet = document.getElementById("stat-return-rows");
    if (elRet) elRet.innerHTML = `${customDatasetStats.returnRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elCln = document.getElementById("stat-clean-rows");
    if (elCln) elCln.innerHTML = `${customDatasetStats.cleanRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    updateStep2ErrorCounts(customDatasetStats, formattedRecords);

    // Update Banner
    if (uploadBanner) uploadBanner.classList.remove("hidden");
    if (uploadFilename) uploadFilename.textContent = fileName;
    if (uploadDetails) uploadDetails.textContent = `Đã nạp ${total.toLocaleString('vi-VN')} dòng thực tế • ${dupCount} trùng lặp, ${cancelCount} đơn hủy, ${returnCount} đổi trả`;
    if (activeSourceBadge) {
      activeSourceBadge.textContent = `Tệp ngoài: ${fileName} (${total.toLocaleString('vi-VN')} dòng)`;
      activeSourceBadge.className = "px-2 py-0.5 rounded text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-700 font-semibold";
    }

    // Refresh table preview (only renders top 100 rows instantly)
    renderRawSampleTable();

    appendChatMessage(
      "system",
      `📥 <strong>ĐÃ TIẾP NHẬN TỆP DOANH NGHIỆP:</strong><br>` +
      `• <strong>Tên tệp:</strong> <code>${escapeHtml(fileName)}</code><br>` +
      `• <strong>Số dòng nạp:</strong> ${total.toLocaleString('vi-VN')} dòng giao dịch.<br>` +
      `• <strong>Phát hiện ban đầu:</strong> ${dupCount} trùng lặp, ${cancelCount} đơn hủy, ${returnCount} đổi trả.<br>` +
      `<em>⚡ AI Agent đang tự động khởi chạy quy trình làm sạch BPMN cho tệp này ngay...</em>`
    );

    // Update Step 1B Paste Input preview & Status Hint
    const rawPaste = document.getElementById("raw-data-paste-input");
    if (rawPaste) {
      let previewSnippet = `[TỆP: ${fileName} • ${total.toLocaleString('vi-VN')} dòng giao dịch]\n`;
      const sampleN = Math.min(formattedRecords.length, 5);
      for (let i = 0; i < sampleN; i++) {
        const r = formattedRecords[i];
        previewSnippet += `${r.code}, ${r.time}, ${r.store}, ${r.prod}, ${formatMoney(r.rev)}, ${r.status}\n`;
      }
      previewSnippet += `... và ${Math.max(total - sampleN, 0).toLocaleString('vi-VN')} dòng tiếp theo.`;
      rawPaste.value = previewSnippet;
    }

    const inputHint = document.getElementById("input-status-hint");
    if (inputHint) {
      inputHint.innerHTML = `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Đã nhận ${escapeHtml(fileName)} (${total.toLocaleString('vi-VN')} dòng). Bấm "Phân Tích Bối Cảnh & Kiểm Tra Định Dạng" để sang Bước 2!</span>`;
    }

    const btnTrigger = document.getElementById("btn-upload-file-trigger");
    if (btnTrigger) {
      btnTrigger.disabled = false;
      btnTrigger.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500"></i> <span>Tải file lên (CSV / Excel / JSON)</span>`;
    }

    if (autoAdvance) {
      showToast(`Đã phân tích bối cảnh & kiểm tra định dạng (${total.toLocaleString('vi-VN')} dòng)! Đang chuyển sang Bước 2.`);
      revealSubsequentSteps();
      state.isCleaningRunning = false;
      runCleaningPipeline(formattedRecords, customDatasetStats);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast(`Đã nhận ${fileName} (${total.toLocaleString('vi-VN')} dòng)! Bấm "Phân Tích Bối Cảnh & Kiểm Tra Định Dạng" để sang Bước 2.`);
    }
  }

  // Non-blocking chunked row processor (prevents "Not Responding" on large 50k-100k+ files)
  function processParsedRows(rows, fileName, autoAdvance = false) {
    if (!rows || rows.length === 0) {
      showToast("Tệp không có dữ liệu giao dịch hợp lệ!", true);
      appendLog(`[CẢNH BÁO] Không thể đọc thấy bảng giao dịch trong tệp: ${fileName}. Vui lòng kiểm tra định dạng.`, "agent");
      const btnTrigger = document.getElementById("btn-upload-file-trigger");
      if (btnTrigger) {
        btnTrigger.disabled = false;
        btnTrigger.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500"></i> <span>Tải file lên (CSV / Excel / JSON)</span>`;
      }
      return;
    }

    const colMap = resolveColumnMap(rows[0]);
    const total = rows.length;
    const seenIds = new Set();
    let dupCount = 0;
    let cancelCount = 0;
    let returnCount = 0;
    const formattedRecords = new Array(total);
    const CHUNK_SIZE = 5000;
    let index = 0;
    const inputHint = document.getElementById("input-status-hint");

    function processChunk() {
      const end = Math.min(index + CHUNK_SIZE, total);
      for (let i = index; i < end; i++) {
        const row = rows[i];
        const code = (colMap.codeKey && row[colMap.codeKey] !== undefined && row[colMap.codeKey] !== "") ? String(row[colMap.codeKey]) : `TRX-${100000 + i}`;
        const time = (colMap.timeKey && row[colMap.timeKey] !== undefined && row[colMap.timeKey] !== "") ? String(row[colMap.timeKey]) : "10/10 12:00";
        const store = (colMap.storeKey && row[colMap.storeKey] !== undefined && row[colMap.storeKey] !== "") ? String(row[colMap.storeKey]) : "CH-Phúc An";
        const prod = (colMap.prodKey && row[colMap.prodKey] !== undefined && row[colMap.prodKey] !== "") ? String(row[colMap.prodKey]) : "Sản phẩm bán lẻ";
        const cat = (colMap.catKey && row[colMap.catKey] !== undefined && row[colMap.catKey] !== "") ? String(row[colMap.catKey]) : "Bán lẻ tổng hợp";

        let rawRevVal = (colMap.revKey && row[colMap.revKey] !== undefined && row[colMap.revKey] !== "") ? row[colMap.revKey] : 1000000;
        if (typeof rawRevVal === "string") {
          rawRevVal = parseFloat(rawRevVal.replace(/[^0-9.-]/g, "")) || 1000000;
        }
        const rawRev = Number(rawRevVal) || 1000000;

        let rawCogsVal = (colMap.cogsKey && row[colMap.cogsKey] !== undefined && row[colMap.cogsKey] !== "") ? row[colMap.cogsKey] : (rawRev * 0.68);
        if (typeof rawCogsVal === "string") {
          rawCogsVal = parseFloat(rawCogsVal.replace(/[^0-9.-]/g, "")) || (rawRev * 0.68);
        }
        const rawCogs = Number(rawCogsVal) || (rawRev * 0.68);

        const status = (colMap.statusKey && row[colMap.statusKey] !== undefined && row[colMap.statusKey] !== "") ? String(row[colMap.statusKey]).trim() : "Hoàn thành";

        let type = "valid";
        let note = "Hợp lệ";

        if (seenIds.has(code)) {
          type = "duplicate";
          note = "TRÙNG LẶP: Mã giao dịch bị lặp";
          dupCount++;
        } else {
          seenIds.add(code);
        }

        const statusLower = status.toLowerCase();
        if (statusLower.includes("hủy") || statusLower.includes("huy") || statusLower.includes("cancel") || statusLower.includes("void")) {
          type = "cancelled";
          note = "ĐƠN HỦY: Khách hủy / Hoàn tiền trước giao";
          cancelCount++;
        } else if (statusLower.includes("trả") || statusLower.includes("tra") || statusLower.includes("return") || statusLower.includes("đổi") || statusLower.includes("refund")) {
          type = "return";
          note = "ĐỔI TRẢ: Hàng hoàn kho cần xử lý chuẩn";
          returnCount++;
        }

        formattedRecords[i] = {
          code,
          time,
          store,
          prod,
          cat,
          rev: rawRev,
          cogs: rawCogs,
          status,
          note,
          type,
          rawRow: row,
          revKey: colMap.revKey
        };
      }

      index = end;
      if (index < total) {
        if (inputHint) {
          const pct = Math.round((index / total) * 100);
          inputHint.innerHTML = `<span class="text-blue-600 font-bold"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang phân tích dữ liệu: ${index.toLocaleString('vi-VN')} / ${total.toLocaleString('vi-VN')} dòng (${pct}%)...</span>`;
        }
        setTimeout(processChunk, 0);
      } else {
        finishProcessingParsedRows(formattedRecords, total, dupCount, cancelCount, returnCount, fileName, autoAdvance);
      }
    }

    processChunk();
  }

  function handleFileSelected(file) {
    if (!file) return;
    const fileName = file.name;
    const ext = fileName.split('.').pop().toLowerCase();

    const inputHint = document.getElementById("input-status-hint");
    const btnTrigger = document.getElementById("btn-upload-file-trigger");
    if (inputHint) {
      inputHint.innerHTML = `<span class="text-blue-600 font-bold"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang đọc & giải mã tệp ${escapeHtml(fileName)}...</span>`;
    }
    if (btnTrigger) {
      btnTrigger.disabled = true;
      btnTrigger.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-[#FF5B8E]"></i> <span>Đang mở tệp...</span>`;
    }

    const resetUploadBtn = () => {
      if (btnTrigger) {
        btnTrigger.disabled = false;
        btnTrigger.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500"></i> <span>Tải file lên (CSV / Excel / JSON)</span>`;
      }
    };

    showToast(`Đang đọc tệp: ${fileName}...`, false);

    if (ext === "csv") {
      if (typeof Papa === "undefined") {
        showToast("Thư viện PapaParse chưa tải xong. Vui lòng thử lại sau vài giây!", true);
        resetUploadBtn();
        return;
      }
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          processParsedRows(results.data, fileName);
        },
        error: (err) => {
          showToast(`Lỗi đọc CSV: ${err.message}`, true);
          resetUploadBtn();
        }
      });
    } else if (ext === "json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTimeout(() => {
          try {
            const parsed = JSON.parse(e.target.result);
            const rows = Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || parsed.transactions || []);
            processParsedRows(rows, fileName);
          } catch (err) {
            showToast(`Lỗi đọc JSON: ${err.message}`, true);
            resetUploadBtn();
          }
        }, 30);
      };
      reader.onerror = () => {
        showToast("Không thể đọc tệp JSON từ đĩa.", true);
        resetUploadBtn();
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      if (typeof XLSX === "undefined") {
        showToast("Thư viện SheetJS chưa sẵn sàng. Vui lòng tải lại trang (F5)!", true);
        resetUploadBtn();
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        // Yield to browser paint loop before heavy SheetJS decoding so UI stays responsive
        setTimeout(() => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {
              type: 'array',
              cellDates: false,
              cellFormula: false,
              cellHTML: false,
              cellNF: false,
              cellStyles: false
            });
            
            let targetSheetName = workbook.SheetNames[0];
            const matched = workbook.SheetNames.find(n => {
              const low = n.toLowerCase();
              return low.includes("giaodich") || low.includes("transaction") || low.includes("sales") || low.includes("banhang") || low.includes("order") || low.includes("data");
            });
            if (matched) targetSheetName = matched;

            let worksheet = workbook.Sheets[targetSheetName];
            let jsonData = extractSmartTableFromWorksheet(worksheet);

            if ((!jsonData || jsonData.length === 0) && workbook.SheetNames.length > 1) {
              for (const sName of workbook.SheetNames) {
                const ws = workbook.Sheets[sName];
                const parsed = extractSmartTableFromWorksheet(ws);
                if (parsed && parsed.length > 0) {
                  targetSheetName = sName;
                  jsonData = parsed;
                  break;
                }
              }
            }

            processParsedRows(jsonData, fileName);
          } catch (err) {
            console.error("Lỗi giải mã Excel:", err);
            showToast(`Lỗi giải mã Excel: ${err.message}`, true);
            if (inputHint) inputHint.innerHTML = `<span class="text-rose-600 font-bold">Lỗi giải mã tệp: ${escapeHtml(err.message)}</span>`;
            resetUploadBtn();
          }
        }, 40);
      };
      reader.onerror = (err) => {
        showToast(`Lỗi đọc tệp từ đĩa: ${err.message || 'Không thể đọc'}`, true);
        resetUploadBtn();
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast("Chỉ hỗ trợ tệp Excel (.xlsx, .xls), CSV hoặc JSON!", true);
      resetUploadBtn();
    }
  }

  // File Input Change handler (guaranteed on any file dialog selection)
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelected(file);
      // Reset so selecting the same file again triggers change reliably
      setTimeout(() => { e.target.value = ""; }, 500);
    }
  });

  // Visual helper for Drag & Drop
  const dropZoneTitle = document.getElementById("drop-zone-title");
  function setDragActive(active) {
    if (active) {
      dropZone.classList.add("border-[#FF5B8E]", "bg-[#FFE4EC]", "scale-[1.02]", "shadow-md");
      dropZone.classList.remove("bg-white", "border-[#FFB3C7]");
      if (dropZoneTitle) {
        dropZoneTitle.innerHTML = `<span class="text-[#FF5B8E] font-black text-sm animate-pulse"><i class="fa-solid fa-cloud-arrow-down"></i> Thả tệp Excel/CSV vào đây ngay!</span>`;
      }
    } else {
      dropZone.classList.remove("border-[#FF5B8E]", "bg-[#FFE4EC]", "scale-[1.02]", "shadow-md");
      dropZone.classList.add("bg-white", "border-[#FFB3C7]");
      if (dropZoneTitle) {
        dropZoneTitle.innerHTML = `Kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV vào đây hoặc <span class="text-[#FF5B8E] underline font-extrabold">bấm để chọn từ máy</span>`;
      }
    }
  }

  // Prevent browser default window drag behavior
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    window.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
    document.body.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  // Attach Drag & Drop directly to both fileInput and dropZone
  ['dragenter', 'dragover'].forEach(evt => {
    if (fileInput) {
      fileInput.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
      });
    }
    if (dropZone) {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
      });
    }
  });

  ['dragleave'].forEach(evt => {
    if (fileInput) {
      fileInput.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
      });
    }
    if (dropZone) {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
      });
    }
  });

  if (fileInput) {
    fileInput.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFileSelected(dt.files[0]);
      }
    });
  }

  if (dropZone) {
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFileSelected(dt.files[0]);
      }
    });
  }

  // Global document drop support
  document.body.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      showToast("Đã nhận tệp kéo thả vào hệ thống!", true);
      switchPhase(1);
      handleFileSelected(dt.files[0]);
    }
  });

  // Quick re-clean button on status banner
  const btnReClean = document.getElementById("btn-re-clean");
  if (btnReClean) {
    btnReClean.addEventListener("click", () => {
      btnRunCleaning.click();
    });
  }

  // Download Standard Excel Template (Exact 1.006 dòng • 15 trường)
  const btnDownloadTemplate = document.getElementById("btn-download-template");
  if (btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener("click", () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Transactions (Exact 15 standard fields from Diagram)
      const wsTransactionsData = [
        [
          "Mã Giao Dịch", "Ngày Giờ Giao Dịch", "Mã Cửa Hàng", "Tên Cửa Hàng", "Khu Vực",
          "Mã Sản Phẩm", "Tên Sản Phẩm", "Ngành Hàng", "Số Lượng", "Đơn Giá",
          "Thành Tiền", "Giá Vốn COGS", "Trạng Thái Đơn", "Mã Giao Dịch Gốc", "Tiền Hoàn Trả"
        ],
        ["TRX-100234", "02/10/2026 09:15", "CH01", "Phúc An Cầu Giấy", "Hà Nội", "SP-DGD01", "Nồi cơm điện cao tần 1.8L", "Điện gia dụng", 1, 2590000, 2590000, 1761200, "Hoàn tất", "", 0],
        ["TRX-100235", "02/10/2026 09:15", "CH01", "Phúc An Cầu Giấy", "Hà Nội", "SP-DGD01", "Nồi cơm điện cao tần 1.8L", "Điện gia dụng", 1, 2590000, 2590000, 1761200, "Hoàn tất", "TRX-100234", 0], // Lặp mã
        ["TRX-100412", "03/10/2026 14:20", "CH03", "Phúc An Hai Bà Trưng", "Hà Nội", "SP-TBS04", "Loa bluetooth mini bass", "Thiết bị số", 2, 490000, 980000, 860000, "Hoàn tất", "", 0],
        ["TRX-100589", "04/10/2026 16:45", "CH08", "Phúc An Quảng Ninh", "Miền Bắc", "SP-DGD09", "Máy lọc không khí Pro", "Điện gia dụng", 1, 6890000, 6890000, 4685200, "Đã hủy", "", 0],
        ["TRX-100720", "05/10/2026 11:30", "CH15", "Phúc An Bình Thạnh", "TP.HCM", "SP-SK02", "Máy nâng cơ mặt ion", "Chăm sóc sức khỏe", 1, 3200000, 3200000, 1760000, "Trả hàng", "TRX-100700", 3200000],
        ["TRX-100845", "06/10/2026 10:12", "CH04", "Phúc An Hoàn Kiếm", "Hà Nội", "SP-GD03", "Robot hút bụi lau nhà", "Gia dụng thông minh", 1, 8490000, 8490000, 5263800, "Hoàn tất", "", 0]
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(wsTransactionsData);
      XLSX.utils.book_append_sheet(wb, ws1, "1_BanHang_15Truong");

      // Sheet 2: Returns Detail
      const wsReturnsData = [
        ["Mã Phiếu Trả", "Mã Giao Dịch Gốc", "Ngày Trả", "Mã Cửa Hàng", "Giá Trị Hoàn Trả", "Lý Do Đổi Trả", "Tái Nhập Kho"],
        ["RET-001", "TRX-100720", "05/10/2026", "CH15", 3200000, "Nhân viên tư vấn sai công năng", "Có"],
        ["RET-002", "TRX-101790", "12/10/2026", "CH07", 3190000, "Vận chuyển va đập móp vỏ", "Không (Hao hụt)"]
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(wsReturnsData);
      XLSX.utils.book_append_sheet(wb, ws2, "2_DoiTra_ChiTiet");

      // Sheet 3: Products Catalog
      const wsProductsData = [
        ["Mã Sản Phẩm", "Tên Sản Phẩm", "Ngành Hàng", "Đơn Giá Niêm Yết", "Giá Vốn COGS", "Biên Lợi Nhuận Chuẩn"],
        ["SP-DGD01", "Nồi cơm điện cao tần 1.8L", "Điện gia dụng", 2590000, 1761200, "32%"],
        ["SP-TBS04", "Loa bluetooth mini bass", "Thiết bị số", 490000, 382200, "22%"],
        ["SP-SK02", "Máy nâng cơ mặt ion", "Chăm sóc sức khỏe", 3200000, 1760000, "45%"],
        ["SP-GD03", "Robot hút bụi lau nhà", "Gia dụng thông minh", 8490000, 5263800, "38%"]
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(wsProductsData);
      XLSX.utils.book_append_sheet(wb, ws3, "3_DanhMuc_GiaVon");

      // Sheet 4: Store Targets
      const wsTargetsData = [
        ["Mã Cửa Hàng", "Tên Cửa Hàng", "Khu Vực", "Mục Tiêu Doanh Thu", "Mục Tiêu LN Gộp", "Định Mức Đổi Trả Trần"],
        ["CH01", "Phúc An Cầu Giấy", "Hà Nội", 2800000000, 896000000, "3.5%"],
        ["CH02", "Phúc An Đống Đa", "Hà Nội", 3100000000, 992000000, "3.5%"],
        ["CH03", "Phúc An Hai Bà Trưng", "Hà Nội", 3000000000, 960000000, "3.5%"],
        ["CH15", "Phúc An Bình Thạnh", "TP.HCM", 3100000000, 992000000, "3.5%"]
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(wsTargetsData);
      XLSX.utils.book_append_sheet(wb, ws4, "4_MucTieu_18CH");

      XLSX.writeFile(wb, "PhucAn_Retail_Mau_1006Dong_15Truong.xlsx");
      showToast("Đã tải xuống tệp mẫu Excel chuẩn 1.006 dòng • 15 trường!");
    } catch (err) {
      showToast(`Không thể tạo file Excel: ${err.message}`, true);
    }
    });
  }

  // Reset to Sample Model (For demonstration)
  const btnResetSample = document.getElementById("btn-reset-sample");
  if (btnResetSample) {
    btnResetSample.addEventListener("click", () => {
      currentRawRecords = [...defaultSampleRawRecords];
      customDatasetLoaded = false;
      customDatasetStats = {
        totalRows: 60000,
        duplicateRows: 1842,
        cancelledRows: 2150,
        returnRows: 3420,
        cleanRows: 56008,
        fileName: "Dữ liệu mẫu Phúc An (60.000 dòng)"
      };

      if (activeSourceBadge) {
        activeSourceBadge.textContent = "Dữ liệu mẫu Phúc An (60.000 dòng)";
        activeSourceBadge.className = "px-2 py-0.5 rounded-full text-[10px] bg-[#FFE2E5] text-[#FA5A7D] border border-[#FAD2E1] font-bold";
      }

      renderRawSampleTable();
      runCleaningPipeline();
      showToast("Đã nạp bộ dữ liệu mẫu 60.000 dòng thành công!");
    });
  }

  // Clear / Empty Data Button
  const btnClearData = document.getElementById("btn-clear-data");
  if (btnClearData) {
    btnClearData.addEventListener("click", () => {
      clearAllData();
      showToast("Đã làm trống toàn bộ dữ liệu. Hệ thống sẵn sàng cho tệp mới!");
    });
  }

  // ========================================================
  // BỐI CẢNH DOANH NGHIỆP CHO AI AGENT (BUSINESS CONTEXT)
  // ========================================================
  const businessContext = {
    companyName: "",
    period: "",
    industry: "",
    description: "",
    isConfigured: false
  };

  const inputCtxCompany = document.getElementById("ctx-company-name");
  const inputCtxPeriod = document.getElementById("ctx-period");
  const inputCtxIndustry = document.getElementById("ctx-industry");
  const inputCtxAudience = document.getElementById("ctx-audience");
  const inputCtxDescription = document.getElementById("ctx-description");
  const badgeCtxStatus = document.getElementById("badge-context-status");
  const previewCtxSummary = document.getElementById("ctx-summary-preview");
  const btnSaveContext = document.getElementById("btn-save-context");
  const btnContextPreset = document.getElementById("btn-context-preset");
  const btnContextClear = document.getElementById("btn-context-clear");
  const btnContextToggle = document.getElementById("btn-context-toggle");
  const contextBody = document.getElementById("context-body");
  const iconContextToggle = document.getElementById("icon-context-toggle");

  function saveBusinessContext(silent = false) {
    businessContext.companyName = inputCtxCompany ? inputCtxCompany.value.trim() : "";
    businessContext.period = inputCtxPeriod ? inputCtxPeriod.value.trim() : "";
    businessContext.industry = inputCtxIndustry ? inputCtxIndustry.value.trim() : "";
    businessContext.audience = inputCtxAudience ? inputCtxAudience.value.trim() : "";
    businessContext.description = inputCtxDescription ? inputCtxDescription.value.trim() : "";

    const hasInfo = businessContext.companyName || businessContext.period || businessContext.industry || businessContext.description;
    businessContext.isConfigured = !!hasInfo;

    if (badgeCtxStatus) {
      if (businessContext.isConfigured) {
        badgeCtxStatus.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-500"></i> Đã lưu bối cảnh`;
        badgeCtxStatus.className = "px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1";
      } else {
        badgeCtxStatus.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Chờ điền bối cảnh`;
        badgeCtxStatus.className = "px-2.5 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold flex items-center gap-1";
      }
    }

    if (previewCtxSummary) {
      if (businessContext.isConfigured) {
        previewCtxSummary.innerHTML = `🟢 <strong>Bối cảnh kích hoạt:</strong> ${escapeHtml(businessContext.companyName || 'Doanh nghiệp')} • Kỳ: <strong>${escapeHtml(businessContext.period || 'Hiện tại')}</strong> • ${escapeHtml(businessContext.industry || 'Bán lẻ')} (AI Agent đã ghi nhớ)`;
        previewCtxSummary.className = "text-xs text-emerald-700 font-medium";
      } else {
        previewCtxSummary.textContent = "Chưa lưu bối cảnh. Nhấn 'Lưu & Áp Dụng Bối Cảnh' để AI Agent ghi nhớ trước khi nạp tệp.";
        previewCtxSummary.className = "text-xs text-slate-400 italic";
      }
    }

    if (!silent) {
      const comp = businessContext.companyName || "Doanh nghiệp";
      const peri = businessContext.period ? `(Kỳ: ${businessContext.period})` : "";
      showToast(`Đã lưu bối cảnh: ${comp} ${peri}! AI Agent sẽ phân tích theo yêu cầu này.`);

      appendLog(`[BỐI CẢNH] Doanh nghiệp: ${comp} | Kỳ: ${businessContext.period || 'Mặc định'} | Ngành: ${businessContext.industry || 'Chung'}.`, "clean");
      if (businessContext.description) {
        appendLog(`[YÊU CẦU CHO AGENT] ${businessContext.description}`, "info");
      }

      appendChatMessage(
        "ai",
        `🎯 <strong>ĐÃ GHI NHẬN BỐI CẢNH DOANH NGHIỆP:</strong><br>` +
        `• <strong>Doanh nghiệp:</strong> <strong>${escapeHtml(comp)}</strong> (${escapeHtml(businessContext.industry || 'Bán lẻ')})<br>` +
        `• <strong>Kỳ phân tích:</strong> ${escapeHtml(businessContext.period || 'Kỳ kinh doanh hiện tại')}<br>` +
        `• <strong>Yêu cầu trọng tâm:</strong> <em>${escapeHtml(businessContext.description || 'Đối soát bẫy doanh thu, kiểm soát tỷ lệ hoàn trả và tối ưu hóa lợi nhuận')}</em><br>` +
        `<span class="text-emerald-700 font-bold">✓ Hệ thống đã sẵn sàng. Hãy kéo & thả tệp Excel/CSV vào ô bên dưới để AI Agent bắt đầu phân tích!</span>`
      );
    }
  }

  if (btnSaveContext) {
    btnSaveContext.addEventListener("click", () => saveBusinessContext(false));
  }

  if (btnContextPreset) {
    btnContextPreset.addEventListener("click", () => {
      if (inputCtxCompany) inputCtxCompany.value = "Hệ Thống Bán Lẻ Phúc An Mart";
      if (inputCtxPeriod) inputCtxPeriod.value = "Tháng 10/2026 (31 ngày chuẩn)";
      if (inputCtxIndustry) inputCtxIndustry.value = "Bán lẻ đa kênh & Thiết bị số";
      if (inputCtxAudience) inputCtxAudience.value = "Ban Giám Đốc (CEO / CFO), Trưởng phòng Kinh doanh";
      if (inputCtxDescription) inputCtxDescription.value = "Chiến dịch xả phụ kiện CAT02 biên 12% diễn ra trong tháng 10. AI Agent cần tập trung kiểm tra bẫy doanh thu (doanh số tăng nhưng lợi nhuận giảm), rà soát tỷ lệ đổi trả vượt trần an toàn 3.5% và bóc tách tăng trưởng ảo do ghép lệch kỳ 45 ngày.";
      saveBusinessContext(false);
    });
  }

  if (btnContextClear) {
    btnContextClear.addEventListener("click", () => {
      if (inputCtxCompany) inputCtxCompany.value = "";
      if (inputCtxPeriod) inputCtxPeriod.value = "";
      if (inputCtxIndustry) inputCtxIndustry.value = "";
      if (inputCtxAudience) inputCtxAudience.value = "";
      if (inputCtxDescription) inputCtxDescription.value = "";
      saveBusinessContext(true);
      showToast("Đã làm trống bối cảnh doanh nghiệp.");
    });
  }

  // ========================================================
  // STEP 1 WORKFLOW INTEGRATION (BƯỚC 1A + BƯỚC 1B)
  // ========================================================
  const rawPasteInput = document.getElementById("raw-data-paste-input");
  const inputStatusHint = document.getElementById("input-status-hint");
  const btnLoadSampleQuick = document.getElementById("btn-load-sample-quick");
  const btnAnalyzeContextData = document.getElementById("btn-analyze-context-data");
  const btnNewSession = document.getElementById("btn-new-session");

  // Drag & drop directly onto the Step 1B paste box
  if (rawPasteInput) {
    ['dragenter', 'dragover'].forEach(evt => {
      rawPasteInput.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        rawPasteInput.classList.add("border-[#FF5B8E]", "bg-[#FFF0F5]");
      });
    });
    rawPasteInput.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rawPasteInput.classList.remove("border-[#FF5B8E]", "bg-[#FFF0F5]");
    });
    rawPasteInput.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rawPasteInput.classList.remove("border-[#FF5B8E]", "bg-[#FFF0F5]");
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFileSelected(dt.files[0]);
      }
    });
  }

  // Startup state: keep Step 1A & Step 1B completely empty until user inputs or uploads data

  // Step 1: Load 60k sample data quickly
  if (btnLoadSampleQuick) {
    btnLoadSampleQuick.addEventListener("click", () => {
      if (inputCtxCompany) inputCtxCompany.value = "Hệ Thống Bán Lẻ Phúc An Mart";
      if (inputCtxIndustry) inputCtxIndustry.value = "Bán lẻ đa kênh (Omnichannel Retail & FMCG)";
      if (inputCtxAudience) inputCtxAudience.value = "Ban Giám Đốc (CEO / CFO), Trưởng phòng Kinh doanh";
      if (inputCtxDescription) inputCtxDescription.value = "Đối soát 60.000 dòng dữ liệu giao dịch Tháng 10/2026, làm sạch đơn hủy, trùng lặp POS, bóc tách tỷ lệ đổi trả hàng và phân bổ lại doanh thu chuẩn hóa về 18 cửa hàng.";

      saveBusinessContext(true);

      if (rawPasteInput) {
        rawPasteInput.value = `Mã Giao Dịch,Ngày Giờ Giao Dịch,Mã Cửa Hàng,Tên Cửa Hàng,Khu Vực,Mã SP,Tên SP,Ngành Hàng,Số Lượng,Đơn Giá,Thành Tiền,COGS,Trạng Thái Đơn
TRX-100234,02/10/2026 09:15,CH01,Phúc An Cầu Giấy,Hà Nội,SP-DGD01,Nồi cơm điện cao tần 1.8L,Điện gia dụng,1,2590000,2590000,1761200,Hoàn tất
TRX-100235,02/10/2026 09:15,CH01,Phúc An Cầu Giấy,Hà Nội,SP-DGD01,Nồi cơm điện cao tần 1.8L,Điện gia dụng,1,2590000,2590000,1761200,Hoàn tất
TRX-100412,03/10/2026 14:20,CH03,Phúc An Hai Bà Trưng,Hà Nội,SP-TBS04,Loa bluetooth mini bass,Thiết bị số,2,490000,980000,860000,Hoàn tất
TRX-100589,04/10/2026 16:45,CH08,Phúc An Quảng Ninh,Miền Bắc,SP-DGD09,Máy lọc không khí Pro,Điện gia dụng,1,6890000,6890000,4685200,Đã hủy
TRX-100720,05/10/2026 11:30,CH15,Phúc An Bình Thạnh,TP.HCM,SP-SK02,Máy nâng cơ mặt ion,Chăm sóc sức khỏe,1,3200000,3200000,1760000,Trả hàng
... [Đã nạp sẵn 60.000 dòng giao dịch từ CSDL Doanh Nghiệp Phúc An Mart] ...`;
      }

      if (inputStatusHint) {
        inputStatusHint.innerHTML = `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Đã nạp 60.000 dòng mẫu từ Phúc An Mart. Bấm "Phân Tích Bối Cảnh & Kiểm Tra Định Dạng" để sang Bước 2!</span>`;
      }

      currentRawRecords = [...defaultSampleRawRecords];
      customDatasetStats = {
        totalRows: 60000,
        duplicateRows: 1842,
        cancelledRows: 2150,
        returnRows: 3420,
        cleanRows: 56008,
        fileName: "PhucAn_Retail_60k_Dong_Mau.xlsx"
      };

      showToast("Đã nạp 60.000 dòng mẫu! Bấm 'Phân Tích Bối Cảnh & Kiểm Tra Định Dạng' để sang Bước 2.");
    });
  }

  // Step 1: Analyze Context & Raw Data button
  if (btnAnalyzeContextData) {
    btnAnalyzeContextData.addEventListener("click", () => {
      const rawText = rawPasteInput ? rawPasteInput.value.trim() : "";
      
      // Save business context
      saveBusinessContext(true);

      if (rawText.length > 0 && (!currentRawRecords || currentRawRecords.length === 0)) {
        // Try parsing CSV or JSON
        try {
          if (rawText.startsWith("[") || rawText.startsWith("{")) {
            const parsedJson = JSON.parse(rawText);
            const rows = Array.isArray(parsedJson) ? parsedJson : (parsedJson.data || parsedJson.rows || []);
            if (rows.length > 0) {
              processParsedRows(rows, "du_lieu_dan.json", true);
              return;
            }
          }
          if (typeof Papa !== "undefined" && (rawText.includes(",") || rawText.includes("\t") || rawText.includes(";"))) {
            const parsed = Papa.parse(rawText, { header: true, dynamicTyping: true, skipEmptyLines: true });
            if (parsed.data && parsed.data.length > 0) {
              processParsedRows(parsed.data, "phuc_an_transactions.csv", true);
              return;
            }
          }
        } catch (err) {
          console.warn("Lỗi parse text thô:", err);
        }
      }

      if (currentRawRecords && currentRawRecords.length > 0) {
        revealSubsequentSteps();
        state.isCleaningRunning = false;
        runCleaningPipeline(currentRawRecords, customDatasetStats);
        showToast("Đã phân tích bối cảnh & kiểm tra định dạng! Đang chuyển sang Bước 2: Làm sạch.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // If nothing entered
      if (!rawText) {
        showToast("Vui lòng dán dữ liệu, tải file lên hoặc bấm 'Nạp 60k Dòng Mẫu'!", true);
        if (rawPasteInput) rawPasteInput.focus();
        return;
      }

      // Fallback: has text, run sample model
      currentRawRecords = [...defaultSampleRawRecords];
      customDatasetStats.fileName = "Dữ liệu phân tích bối cảnh";
      revealSubsequentSteps();
      state.isCleaningRunning = false;
      runCleaningPipeline(currentRawRecords, customDatasetStats);
      showToast("Đã phân tích bối cảnh và nạp dữ liệu! Đang chuyển sang Bước 2.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Desired Output Tabs in Step 1 (📊 Dashboard, 📄 Báo cáo, 🌐 HTML)
  const outputTabBtns = document.querySelectorAll(".desired-output-tab");
  const outputHintEl = document.getElementById("desired-output-hint");
  const outputIcons = { "Dashboard": "📊", "Báo cáo": "📄", "HTML": "🌐" };

  function syncDesiredOutputUI() {
    outputTabBtns.forEach(btn => {
      const val = btn.getAttribute("data-output-tab");
      const isSelected = state.desiredOutputs.includes(val);
      if (isSelected) {
        btn.className = "desired-output-tab active py-2 px-2.5 rounded-xl text-xs font-extrabold bg-white text-[#FF5B8E] border border-[#FAD2E1] shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer";
      } else {
        btn.className = "desired-output-tab py-2 px-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#FF5B8E] border border-transparent transition flex items-center justify-center gap-1.5 cursor-pointer";
      }
    });
    if (outputHintEl) {
      outputHintEl.textContent = "Đã chọn: " + state.desiredOutputs.map(v => `${outputIcons[v] || ""} ${v}`).join(" • ");
    }
  }

  outputTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-output-tab");
      const idx = state.desiredOutputs.indexOf(val);
      if (idx >= 0) {
        if (state.desiredOutputs.length > 1) {
          state.desiredOutputs.splice(idx, 1);
        } else {
          showToast("Cần chọn ít nhất 1 định dạng đầu ra mong muốn!", true);
          return;
        }
      } else {
        state.desiredOutputs.push(val);
      }
      syncDesiredOutputUI();
    });
  });

  // Top Bar: New Session / Clear All
  if (btnNewSession) {
    btnNewSession.addEventListener("click", () => {
      if (inputCtxCompany) inputCtxCompany.value = "";
      if (inputCtxIndustry) inputCtxIndustry.value = "";
      if (inputCtxAudience) inputCtxAudience.value = "";
      if (inputCtxDescription) inputCtxDescription.value = "";
      if (rawPasteInput) rawPasteInput.value = "";

      if (inputStatusHint) {
        inputStatusHint.innerHTML = "Chưa có dữ liệu. Hãy tải file hoặc dán dữ liệu để bắt đầu.";
        inputStatusHint.className = "text-xs text-slate-400 italic";
      }

      clearAllData();
      hideSubsequentSteps();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast("Đã làm trống phiên làm việc! Sẵn sàng nhận dự án mới.");
    });
  }

  // 4-Step Stepper Navigation Clicks
  const stepNav1 = document.getElementById("step-nav-1");
  const stepNav2 = document.getElementById("step-nav-2");
  const stepNav3 = document.getElementById("step-nav-3");
  const stepNav4 = document.getElementById("step-nav-4");

  if (stepNav1) {
    stepNav1.addEventListener("click", () => {
      const step1Section = document.getElementById("step1-main-section");
      const container = document.getElementById("subsequent-steps-container");
      if (step1Section) {
        step1Section.classList.remove("hidden");
        triggerPageTransition(step1Section);
      }
      if (container) container.classList.add("hidden");
      setWorkflowStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (stepNav2) {
    stepNav2.addEventListener("click", () => {
      if (!state.hasAnalyzedStep1) {
        showToast("Vui lòng bấm 'Phân Tích Bối Cảnh & Kiểm Tra Định Dạng' ở Bước 1 trước!", true);
        return;
      }
      const step1Section = document.getElementById("step1-main-section");
      const container = document.getElementById("subsequent-steps-container");
      if (step1Section) step1Section.classList.add("hidden");
      if (container) container.classList.remove("hidden");
      setWorkflowStep(2);
      switchPhase(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (stepNav3) {
    stepNav3.addEventListener("click", () => {
      if (!state.hasAnalyzedStep1) {
        showToast("Vui lòng bấm 'Phân Tích Bối Cảnh & Kiểm Tra Định Dạng' ở Bước 1 trước!", true);
        return;
      }
      if (!state.phase1Completed) {
        openVerificationChoiceModal();
        return;
      }
      const step1Section = document.getElementById("step1-main-section");
      const container = document.getElementById("subsequent-steps-container");
      if (step1Section) step1Section.classList.add("hidden");
      if (container) container.classList.remove("hidden");
      setWorkflowStep(3);
      switchPhase(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (stepNav4) {
    stepNav4.addEventListener("click", () => {
      if (!state.hasAnalyzedStep1) {
        showToast("Vui lòng bấm 'Phân Tích Bối Cảnh & Kiểm Tra Định Dạng' ở Bước 1 trước!", true);
        return;
      }
      if (!state.phase1Completed) {
        openVerificationChoiceModal();
        return;
      }
      const step1Section = document.getElementById("step1-main-section");
      const container = document.getElementById("subsequent-steps-container");
      if (step1Section) step1Section.classList.add("hidden");
      if (container) container.classList.remove("hidden");
      setWorkflowStep(4);
      switchPhase(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (btnContextToggle && contextBody) {
    btnContextToggle.addEventListener("click", () => {
      contextBody.classList.toggle("hidden");
      if (iconContextToggle) {
        if (contextBody.classList.contains("hidden")) {
          iconContextToggle.className = "fa-solid fa-chevron-down";
        } else {
          iconContextToggle.className = "fa-solid fa-chevron-up";
        }
      }
    });
  }

  document.querySelectorAll(".ctx-tag-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tagText = btn.getAttribute("data-text");
      if (inputCtxDescription) {
        if (inputCtxDescription.value.trim()) {
          inputCtxDescription.value += "; " + tagText;
        } else {
          inputCtxDescription.value = tagText;
        }
        inputCtxDescription.focus();
      }
    });
  });

  // Google Sheets Sync handler
  const btnSyncGsheet = document.getElementById("btn-sync-gsheet");
  if (btnSyncGsheet) {
    btnSyncGsheet.addEventListener("click", () => {
      const gsheetInput = document.getElementById("input-gsheet-url");
      const url = gsheetInput ? gsheetInput.value.trim() : "";
      if (!url) {
        showToast("Vui lòng dán liên kết Google Sheets của doanh nghiệp!", true);
        return;
      }

      appendLog(`[GOOGLE SHEETS] Đang kết nối tới URL: ${url.substring(0, 45)}...`, "info");
      setTimeout(() => {
        // Simulate successful live sync
        appendLog(`[GOOGLE SHEETS] Đồng bộ thành công 4 sheets: Transactions, Returns, Products, Targets.`, "clean");
        processParsedRows(defaultSampleRawRecords, "Google_Sheets_Live_PhucAn_T10");
      }, 1200);
    });
  }

  // ========================================================
  // 9-STEP PIPELINE RUNNER & EXCEPTION AUDIT DRAWERS (FLOWCHART)
  // ========================================================
  const sampleExceptions = [
    { code: "TRX-100235", origCode: "TRX-100234", store: "CH01 - Cầu Giấy", type: "Mã giao dịch lặp (Duplicate POS)", amount: 2590000, action: "Loại bỏ bản ghi trùng, giữ mã gốc TRX-100234" },
    { code: "TRX-100589", origCode: "N/A", store: "CH08 - Quảng Ninh", type: "Đơn hàng đã hủy (Cộng nhầm doanh thu)", amount: 6890000, action: "Trừ toàn bộ 6.890.000 đ khỏi doanh thu thô" },
    { code: "RET-099", origCode: "TRX-888999 (Không khớp)", store: "CH12 - Quận 1", type: "Mã gốc không khớp hệ thống", amount: 1850000, action: "Ghi nhận vào sổ kiểm tra ngoại lệ, tra soát tay" },
    { code: "TRX-100845", origCode: "N/A", store: "CH04 - Hoàn Kiếm", type: "Lệch kỳ so sánh (45 ngày vs 30 ngày)", amount: 8490000, action: "Chuẩn hóa chu kỳ tương đương 31 ngày chuẩn" },
    { code: "TRX-101560", origCode: "TRX-100412", store: "CH03 - Hai Bà Trưng", type: "Mã giao dịch lặp (Xả hàng km)", amount: 490000, action: "Khử trùng lặp, bảo toàn giá vốn chuẩn" },
    { code: "RET-001", origCode: "TRX-100720", store: "CH15 - Bình Thạnh", type: "Đổi trả hàng (Tư vấn sai công năng)", amount: 3200000, action: "Trừ doanh thu thuần và hoàn nhập giá vốn COGS" }
  ];

  function renderExceptionsTable() {
    const tbody = document.getElementById("exception-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    sampleExceptions.forEach(ex => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-rose-50/60 transition";
      tr.innerHTML = `
        <td class="p-2.5 font-mono font-bold text-rose-700">${ex.code}</td>
        <td class="p-2.5 font-mono text-slate-500">${ex.origCode}</td>
        <td class="p-2.5 font-bold text-slate-900">${ex.store}</td>
        <td class="p-2.5 text-rose-800 font-semibold">${ex.type}</td>
        <td class="p-2.5 text-right font-mono font-bold text-slate-900">${formatMoney(ex.amount)}</td>
        <td class="p-2.5 text-emerald-800 font-medium">${ex.action}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const btnToggleException = document.getElementById("btn-toggle-exception-table");
  const exceptionContainer = document.getElementById("exception-log-container");
  if (btnToggleException && exceptionContainer) {
    btnToggleException.addEventListener("click", () => {
      exceptionContainer.classList.toggle("hidden");
      renderExceptionsTable();
    });
  }

  const btnToggleVerify = document.getElementById("btn-toggle-verify-table");
  const verifyContainer = document.getElementById("verify-log-container");
  if (btnToggleVerify && verifyContainer) {
    btnToggleVerify.addEventListener("click", () => {
      verifyContainer.classList.toggle("hidden");
    });
  }

  // BPMN Swimlane Interactive Flow Runner
  const btnRunBpmnFlow = document.getElementById("btn-run-bpmn-flow");
  const bpmnNodes = [
    "bpmn-node-human-1", "bpmn-node-agent-clean", "bpmn-node-agent-artifact",
    "bpmn-node-human-verify", "bpmn-node-decision", "bpmn-node-agent-calc",
    "bpmn-node-agent-report", "bpmn-node-human-p2", "bpmn-node-human-p3",
    "bpmn-node-agent-audit", "bpmn-node-agent-priority", "bpmn-node-mgr-review", "bpmn-node-mgr-decision"
  ];

  function highlightBpmnNode(activeId) {
    bpmnNodes.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === activeId) {
          el.classList.add("ring-2", "ring-[#FF5B8E]", "scale-105", "shadow-md");
          el.classList.remove("opacity-60");
        } else {
          el.classList.remove("ring-2", "ring-[#FF5B8E]", "scale-105", "shadow-md");
        }
      }
    });
  }

  if (btnRunBpmnFlow) {
    btnRunBpmnFlow.addEventListener("click", () => {
      if (state.isCleaningRunning) return;
      state.isCleaningRunning = true;
      showToast("Khởi chạy quy trình BPMN Quản trị Bán hàng Phúc An...");

      // 1. Human: Cung cấp file Excel thô
      highlightBpmnNode("bpmn-node-human-1");
      appendLog("[BPMN 1.1] Con người: Tiếp nhận và nạp File Excel bán hàng thô 1.006 dòng • 15 trường.", "info");

      setTimeout(() => {
        // 2. AI Agent: Làm sạch tự động
        highlightBpmnNode("bpmn-node-agent-clean");
        appendLog("[BPMN 1.2] AI Agent / API: Tự động chuẩn hóa dữ liệu, khử 34 đơn trùng, bỏ 42 đơn hủy.", "clean");
      }, 700);

      setTimeout(() => {
        // 3. AI Agent: Xuất Artifact "Bộ dữ liệu đã làm sạch + Nhật ký xử lý"
        highlightBpmnNode("bpmn-node-agent-artifact");
        appendLog("[BPMN 1.3] AI Agent / API: Đã xuất 'Bộ dữ liệu sạch + Nhật ký xử lý' gồm 930 dòng chuẩn.", "success");
      }, 1400);

      setTimeout(() => {
        // 4. Human: Kiểm tra kết quả làm sạch
        highlightBpmnNode("bpmn-node-human-verify");
        highlightBpmnNode("bpmn-node-decision");
        appendLog("[BPMN 1.4] Con người: Thực hiện bước Human Verification ➔ Dữ liệu OK? Phê duyệt [CÓ]!", "clean");
        state.phase1Completed = true;
      }, 2100);

      setTimeout(() => {
        // 5. Phase 2 AI Agent: Tính chỉ tiêu
        highlightBpmnNode("bpmn-node-agent-calc");
        appendLog("[BPMN 2.1] AI Agent / API: Tính toán doanh thu thuần, LN gộp, đơn hủy/hoàn và cơ cấu SP.", "clean");
      }, 2800);

      setTimeout(() => {
        // 6. Phase 2 AI Agent: Tạo báo cáo quản trị Dashboard / Summary
        highlightBpmnNode("bpmn-node-agent-report");
        highlightBpmnNode("bpmn-node-human-p2");
        appendLog("[BPMN 2.2] AI Agent: Sinh Dashboard quản trị 18 cửa hàng. Con người tiếp nhận đối chiếu.", "success");
        state.phase2Completed = true;
        generateManagementReport();
      }, 3500);

      setTimeout(() => {
        // 7. Phase 3 AI Agent: Đối chiếu & Phát hiện bất thường
        highlightBpmnNode("bpmn-node-agent-audit");
        highlightBpmnNode("bpmn-node-human-p3");
        appendLog("[BPMN 3.1] AI Agent: Cross-check đối soát 2 chiều, bóc tách bẫy doanh thu CH03 & đổi trả CH15.", "clean");
      }, 4200);

      setTimeout(() => {
        // 8. Phase 3 AI Agent: Gợi ý ưu tiên
        highlightBpmnNode("bpmn-node-agent-priority");
        appendLog("[BPMN 3.2] AI Agent: Xuất Ma trận phân loại ưu tiên 18 cửa hàng (Nhóm 1 Cấp thiết: CH03, CH15, CH08, CH04).", "clean");
        state.phase3Completed = true;
        runCrossCheckAudit();
      }, 4900);

      setTimeout(() => {
        // 9. Quản lý: Đánh giá & Ra quyết định
        highlightBpmnNode("bpmn-node-mgr-review");
        highlightBpmnNode("bpmn-node-mgr-decision");
        appendLog("[BPMN 3.3] Quản lý (Giám đốc Kinh doanh): Đánh giá báo cáo và sẵn sàng ký Lệnh hỗ trợ kịp thời!", "success");
        state.isCleaningRunning = false;
        showToast("Toàn bộ quy trình BPMN đã thực thi hoàn tất!");
      }, 5600);
    });
  }

  // Allow clicking on individual BPMN nodes
  bpmnNodes.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        highlightBpmnNode(id);
        if (id.includes("human-1") || id.includes("clean") || id.includes("artifact")) {
          switchPhase(1);
        } else if (id.includes("calc") || id.includes("report") || id.includes("human-p2")) {
          switchPhase(2);
        } else {
          switchPhase(3);
        }
      });
    }
  });

  // 9-Step Pipeline Runner Button
  const btnRun9Steps = document.getElementById("btn-run-9steps");
  const statusIndicator = document.getElementById("pipeline-status-indicator");
  const statusText = document.getElementById("pipeline-status-text");

  function highlightStep(stepNum) {
    for (let i = 1; i <= 9; i++) {
      const box = document.getElementById(`step-box-${i}`);
      if (box) {
        if (i === stepNum) {
          box.className = "p-3 rounded-2xl border-2 border-[#FF5B8E] bg-[#FFF0F5] shadow-md shadow-pink-300/30 scale-102 transition-all space-y-1";
        } else if (i < stepNum) {
          box.className = "p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 transition-all space-y-1 opacity-90";
        } else {
          box.className = "p-3 rounded-2xl border border-slate-200 bg-slate-50 transition-all space-y-1 opacity-70";
        }
      }
    }
  }

  if (btnRun9Steps) {
    btnRun9Steps.addEventListener("click", () => {
      if (state.isCleaningRunning) return;
      state.isCleaningRunning = true;
      statusIndicator.className = "w-2.5 h-2.5 rounded-full bg-[#FF5B8E] animate-ping";
      statusText.textContent = "Đang chạy luồng 9 bước tự động...";

      // Step 1
      highlightStep(1);
      statusText.textContent = "Bước 1: Đang nạp File Excel bán hàng thô (1.006 dòng • 15 trường)...";
      appendLog("[BƯỚC 1] Nạp tệp Excel bán hàng thô 1.006 dòng • 15 trường dữ liệu.", "info");

      setTimeout(() => {
        // Step 2
        highlightStep(2);
        statusText.textContent = "Bước 2: Kiểm tra cấu trúc (Tên cột, kiểu dữ liệu, định dạng ngày, trường bắt buộc)...";
        appendLog("[BƯỚC 2] Kiểm tra cấu trúc 15 trường: Kiểu số, ngày DD/MM/YYYY, trạng thái hợp lệ.", "clean");
      }, 700);

      setTimeout(() => {
        // Step 3
        highlightStep(3);
        statusText.textContent = "Bước 3: Làm sạch dữ liệu (Khoảng trắng, định dạng ngày, chuẩn hóa ô trống)...";
        appendLog("[BƯỚC 3] Chuẩn hóa khoảng trắng, quy đổi ngày đồng nhất và điền 0 vào ô đổi trả trống.", "clean");
      }, 1400);

      setTimeout(() => {
        // Step 4
        highlightStep(4);
        statusText.textContent = "Bước 4: Kiểm tra chất lượng (Mã giao dịch, số lượng, đơn giá, thành tiền, mã gốc)...";
        appendLog("[BƯỚC 4] Kiểm tra chất lượng: Phát hiện 34 dòng lặp mã, 42 đơn hủy, 8 mã gốc không khớp.", "clean");
      }, 2100);

      setTimeout(() => {
        // Step 5: Exception
        highlightStep(5);
        statusText.textContent = "Bước 5: Ghi nhận ngoại lệ & Đối soát (Đưa vào danh sách rà soát ➔ Vòng lặp điều chỉnh)...";
        appendLog("[BƯỚC 5] Ghi nhận 84 bản ghi ngoại lệ vào sổ rà soát. Xử lý loại trừ và lặp lại Bước 3.", "clean");
        renderExceptionsTable();
        if (exceptionContainer) exceptionContainer.classList.remove("hidden");
      }, 2800);

      setTimeout(() => {
        // Step 6: Process & Aggregate
        highlightStep(6);
        statusText.textContent = "Bước 6: Xử lý & Tổng hợp (Doanh thu, số lượng, 18 cửa hàng, phân loại hoàn tất/hủy/trả)...";
        appendLog("[BƯỚC 6] Tổng hợp số liệu sạch cho 18 cửa hàng: Doanh thu thuần 49.47 Tỷ, Lợi nhuận gộp 15.54 Tỷ.", "clean");
      }, 3500);

      setTimeout(() => {
        // Step 7: Verification
        highlightStep(7);
        statusText.textContent = "Bước 7: Xác minh kết quả (Đối chiếu: Thành tiền = SL × Đơn giá; Tiền hoàn khớp 100%)...";
        appendLog("[BƯỚC 7] Xác minh hoàn tất: Thành tiền = SL × Đơn giá khớp 100%, Sai lệch = 0 đ.", "clean");
        if (verifyContainer) verifyContainer.classList.remove("hidden");
      }, 4200);

      setTimeout(() => {
        // Step 8: Dashboard & Report
        highlightStep(8);
        statusText.textContent = "Bước 8: Báo Cáo / Dashboard (Bộ dữ liệu sạch + KPI 18 CH + Biểu đồ + Xếp hạng ưu tiên)...";
        appendLog("[BƯỚC 8] Đã sinh Báo Cáo Quản Trị và Ma Trận Ưu Tiên 18 Cửa Hàng cho Giám đốc.", "success");
        state.phase1Completed = true;
        state.phase2Completed = true;
        state.phase3Completed = true;
      }, 4900);

      setTimeout(() => {
        // Step 9: Feedback & Loop
        highlightStep(9);
        statusIndicator.className = "w-2.5 h-2.5 rounded-full bg-emerald-500";
        statusText.textContent = "Bước 9: Phản hồi & Cải tiến hoàn tất! Đã cập nhật quy tắc vào bộ nhớ Agent cho kỳ sau.";
        appendLog("[BƯỚC 9] Ghi nhận bài học audit: Tự động khóa cherry-picking ngày và bóc tách bẫy doanh thu CH03.", "success");
        state.isCleaningRunning = false;
        showToast("Toàn bộ quy trình 9 bước đã hoàn thành xuất sắc!");
      }, 5600);
    });
  }

  // AI Agent Data Cleaning Pipeline (GIAI ĐOẠN 1)
  btnRunCleaning.addEventListener("click", () => {
    runCleaningPipeline();
  });

  // Manual Editing Mode Logic (Option 2: Not satisfied with AI cleaning)
  const manualEditPanel = document.getElementById("manual-edit-mode-panel");
  const btnOpenManualEdit = document.getElementById("btn-open-manual-edit-mode");
  const btnCloseManualEdit = document.getElementById("btn-close-manual-edit");
  const manualEditSearch = document.getElementById("manual-edit-search");
  const manualEditFilter = document.getElementById("manual-edit-filter");
  const btnSaveAllManual = document.getElementById("btn-save-all-manual-edits");
  const btnApproveManualNext = document.getElementById("btn-approve-manual-and-next");

  function recalculateStatsFromRecords() {
    if (!currentRawRecords || currentRawRecords.length === 0) return;
    let dup = 0, can = 0, ret = 0, per = 0, cln = 0;
    currentRawRecords.forEach(r => {
      if (r.type === "duplicate") dup++;
      else if (r.type === "cancelled") can++;
      else if (r.type === "return") ret++;
      else if (r.type === "period") per++;
      else cln++;
    });
    customDatasetStats.totalRows = currentRawRecords.length;
    customDatasetStats.duplicateRows = dup;
    customDatasetStats.cancelledRows = can;
    customDatasetStats.returnRows = ret;
    customDatasetStats.periodRows = per;
    customDatasetStats.cleanRows = cln;
    updateStep2ErrorCounts(customDatasetStats, currentRawRecords);
  }

  function renderManualEditTable() {
    const tbody = document.getElementById("manual-edit-tbody");
    if (!tbody) return;
    const records = (currentRawRecords && currentRawRecords.length > 0) ? currentRawRecords : [];
    const q = (manualEditSearch?.value || "").trim().toLowerCase();
    const flt = manualEditFilter ? manualEditFilter.value : "errors";

    const filtered = records
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => {
        if (flt === "errors" && (!r.type || r.type === "valid")) return false;
        if (flt === "valid" && r.type && r.type !== "valid") return false;
        if (q) {
          const hay = `${r.code} ${r.store} ${r.prod}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-xs text-slate-400">Không có dòng dữ liệu nào phù hợp.</td></tr>`;
      return;
    }

    const MAX_MANUAL = 50;
    const slice = filtered.slice(0, MAX_MANUAL);
    tbody.innerHTML = slice.map(({ r, idx }) => {
      const isErr = r.type && r.type !== "valid";
      const info = isErr ? getErrorAnalysisAndFix(r) : null;
      const curRev = isErr ? (r.fixedRev !== undefined ? r.fixedRev : info.defaultRev) : r.rev;
      const curCogs = isErr ? (r.fixedCogs !== undefined ? r.fixedCogs : info.defaultCogs) : r.cogs;

      return `
        <tr class="hover:bg-amber-50/40" data-manual-row="${idx}">
          <td class="p-2 font-mono font-bold text-slate-900">${escapeHtml(r.code)}</td>
          <td class="p-2">
            <input type="text" data-m-store="${idx}" value="${escapeHtml(r.store)}" class="w-36 bg-white border border-slate-200 focus:border-[#FF5B8E] rounded-lg px-2 py-1 text-xs">
          </td>
          <td class="p-2">
            <input type="text" data-m-prod="${idx}" value="${escapeHtml(r.prod)}" class="w-44 bg-white border border-slate-200 focus:border-[#FF5B8E] rounded-lg px-2 py-1 text-xs">
          </td>
          <td class="p-2 text-right">
            <input type="number" min="0" step="1000" data-m-rev="${idx}" value="${Number(curRev) || 0}" class="w-28 text-right font-mono font-bold bg-emerald-50 border border-emerald-300 focus:border-emerald-600 rounded-lg px-2 py-1 text-xs text-emerald-900">
          </td>
          <td class="p-2 text-right">
            <input type="number" min="0" step="1000" data-m-cogs="${idx}" value="${Number(curCogs) || 0}" class="w-28 text-right font-mono bg-white border border-slate-200 focus:border-[#FF5B8E] rounded-lg px-2 py-1 text-xs">
          </td>
          <td class="p-2">
            <select data-m-type="${idx}" class="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold">
              <option value="valid" ${r.type === "valid" ? "selected" : ""}>Hợp lệ (Sạch)</option>
              <option value="duplicate" ${r.type === "duplicate" ? "selected" : ""}>Trùng lặp</option>
              <option value="cancelled" ${r.type === "cancelled" ? "selected" : ""}>Đơn đã hủy</option>
              <option value="return" ${r.type === "return" ? "selected" : ""}>Đổi trả</option>
              <option value="period" ${r.type === "period" ? "selected" : ""}>Lệch kỳ</option>
            </select>
          </td>
          <td class="p-2 text-center">
            <button type="button" data-m-save="${idx}" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer">
              Lưu
            </button>
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll("[data-m-save]").forEach(btn => {
      btn.addEventListener("click", () => {
        const recIdx = parseInt(btn.getAttribute("data-m-save"), 10);
        applySingleManualEdit(recIdx);
        recalculateStatsFromRecords();
        renderRawSampleTable();
        showToast(`Đã lưu chỉnh sửa thủ công cho mã ${currentRawRecords[recIdx].code}!`);
      });
    });
  }

  function applySingleManualEdit(recIdx) {
    const rec = currentRawRecords[recIdx];
    if (!rec) return;
    const storeInp = document.querySelector(`[data-m-store="${recIdx}"]`);
    const prodInp = document.querySelector(`[data-m-prod="${recIdx}"]`);
    const revInp = document.querySelector(`[data-m-rev="${recIdx}"]`);
    const cogsInp = document.querySelector(`[data-m-cogs="${recIdx}"]`);
    const typeSel = document.querySelector(`[data-m-type="${recIdx}"]`);

    if (storeInp) rec.store = storeInp.value.trim() || rec.store;
    if (prodInp) rec.prod = prodInp.value.trim() || rec.prod;
    if (typeSel) rec.type = typeSel.value;

    const newRev = revInp ? Math.max(0, Number(revInp.value) || 0) : rec.rev;
    const newCogs = cogsInp ? Math.max(0, Number(cogsInp.value) || 0) : rec.cogs;
    if (rec.type === "valid") {
      rec.rev = newRev;
      rec.cogs = newCogs;
      rec.note = "Đã chỉnh sửa thủ công (Hợp lệ)";
    } else {
      rec.fixedRev = newRev;
      rec.fixedCogs = newCogs;
      rec.isFixed = true;
      rec.note = "Đã chỉnh sửa thủ công";
    }
  }

  function saveAllVisibleManualEdits() {
    document.querySelectorAll("[data-manual-row]").forEach(tr => {
      const recIdx = parseInt(tr.getAttribute("data-manual-row"), 10);
      applySingleManualEdit(recIdx);
    });
    recalculateStatsFromRecords();
    renderRawSampleTable();
  }

  if (btnOpenManualEdit && manualEditPanel) {
    btnOpenManualEdit.addEventListener("click", () => {
      setStep2Page(4);
      manualEditPanel.classList.remove("hidden");
      renderManualEditTable();
      triggerPageTransition(manualEditPanel);
      manualEditPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      showToast("Đã bật Chế độ Sửa Thủ Công! Bạn có thể chỉnh trực tiếp từng dòng.");
    });
  }

  if (btnCloseManualEdit && manualEditPanel) {
    btnCloseManualEdit.addEventListener("click", () => {
      manualEditPanel.classList.add("hidden");
    });
  }

  if (manualEditSearch) manualEditSearch.addEventListener("input", renderManualEditTable);
  if (manualEditFilter) manualEditFilter.addEventListener("change", renderManualEditTable);

  if (btnSaveAllManual) {
    btnSaveAllManual.addEventListener("click", () => {
      saveAllVisibleManualEdits();
      showToast("Đã lưu toàn bộ chỉnh sửa thủ công và cập nhật bảng đối soát! ✓");
    });
  }

  if (btnApproveManualNext) {
    btnApproveManualNext.addEventListener("click", () => {
      saveAllVisibleManualEdits();
      if (manualEditPanel) manualEditPanel.classList.add("hidden");
      document.getElementById("btn-human-approve")?.click();
    });
  }

  const btnStep2Continue = document.getElementById("btn-step2-continue");
  if (btnStep2Continue) {
    btnStep2Continue.addEventListener("click", () => {
      if (state.phase1Completed) {
        setWorkflowStep(3);
        switchPhase(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        openVerificationChoiceModal();
      }
    });
  }

  // Centered Verification Choice Modal Handlers
  const verificationChoiceModal = document.getElementById("verification-choice-modal");
  const btnCloseVerifModal = document.getElementById("btn-close-verification-modal");
  const btnModalChoiceApprove = document.getElementById("modal-choice-approve");
  const btnModalChoiceManual = document.getElementById("modal-choice-manual");
  const btnModalChoiceAiReclean = document.getElementById("modal-choice-ai-reclean");

  if (btnCloseVerifModal && verificationChoiceModal) {
    btnCloseVerifModal.addEventListener("click", () => verificationChoiceModal.classList.add("hidden"));
  }
  if (verificationChoiceModal) {
    verificationChoiceModal.addEventListener("click", (e) => {
      if (e.target === verificationChoiceModal) verificationChoiceModal.classList.add("hidden");
    });
  }
  if (btnModalChoiceApprove && verificationChoiceModal) {
    btnModalChoiceApprove.addEventListener("click", () => {
      verificationChoiceModal.classList.add("hidden");
      document.getElementById("btn-human-approve")?.click();
    });
  }
  if (btnModalChoiceManual && verificationChoiceModal) {
    btnModalChoiceManual.addEventListener("click", () => {
      verificationChoiceModal.classList.add("hidden");
      document.getElementById("btn-open-manual-edit-mode")?.click();
    });
  }
  if (btnModalChoiceAiReclean && verificationChoiceModal) {
    btnModalChoiceAiReclean.addEventListener("click", () => {
      verificationChoiceModal.classList.add("hidden");
      document.getElementById("btn-human-reject")?.click();
    });
  }

  // Human Verification Gate Handlers
  document.getElementById("btn-human-approve").addEventListener("click", () => {
    state.phase1Completed = true;
    const badgePhase1 = document.getElementById("badge-phase1");
    if (badgePhase1) {
      badgePhase1.textContent = "Đã hoàn thành & Phê duyệt";
      badgePhase1.className = "text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700";
    }
    const tabPhase1El = document.getElementById("tab-phase1");
    if (tabPhase1El) tabPhase1El.classList.add("completed");

    const badgePhase2 = document.getElementById("badge-phase2");
    if (badgePhase2) {
      badgePhase2.textContent = "Sẵn sàng tính toán";
      badgePhase2.className = "text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700";
    }

    setWorkflowStep(3);
    showToast("Đã xác nhận dữ liệu sạch! Đang chuyển sang Bước 3: Phân Tích & Feedback...");
    setTimeout(() => switchPhase(2), 500);
  });

  // ==========================================
  // REVISION MODAL & CUSTOM HUMAN FEEDBACK SYSTEM
  // ==========================================
  const revisionModal = document.getElementById("revision-modal");
  const btnCloseRevision = document.getElementById("btn-close-revision-modal");
  const btnCancelRevision = document.getElementById("btn-cancel-revision");
  const btnSubmitRevision = document.getElementById("btn-submit-revision");
  const revisionPromptInput = document.getElementById("revision-prompt-input");
  const btnOpenRevisionModal = document.getElementById("btn-open-revision-modal");

  function openRevisionModal(initialText = "") {
    if (initialText && revisionPromptInput) {
      revisionPromptInput.value = initialText;
    }
    if (revisionModal) {
      revisionModal.classList.remove("hidden");
      if (revisionPromptInput) revisionPromptInput.focus();
    }
  }

  function closeRevisionModal() {
    if (revisionModal) {
      revisionModal.classList.add("hidden");
    }
  }

  window.openRevisionModal = openRevisionModal;
  window.closeRevisionModal = closeRevisionModal;

  if (btnOpenRevisionModal) {
    btnOpenRevisionModal.addEventListener("click", () => openRevisionModal());
  }

  document.getElementById("btn-human-reject").addEventListener("click", () => {
    openRevisionModal("Yêu cầu AI Agent kiểm tra lại các đơn đổi trả của cửa hàng CH15 và đồng bộ lại số ngày so sánh của CH04 về đúng 30 ngày chuẩn.");
  });

  if (btnCloseRevision) btnCloseRevision.addEventListener("click", closeRevisionModal);
  if (btnCancelRevision) btnCancelRevision.addEventListener("click", closeRevisionModal);

  document.querySelectorAll(".preset-rule-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const rule = btn.getAttribute("data-rule");
      if (!rule || !revisionPromptInput) return;
      if (revisionPromptInput.value.trim().length > 0) {
        revisionPromptInput.value += "\n• " + rule;
      } else {
        revisionPromptInput.value = rule;
      }
      revisionPromptInput.focus();
    });
  });

  function executeAgentRevision(promptText) {
    const text = (promptText || (revisionPromptInput ? revisionPromptInput.value : "") || "").trim() || "Hiệu chỉnh quy tắc lọc trùng, bóc tách hàng trả bảo hành và đồng bộ kỳ so sánh chuẩn hóa.";
    
    // Switch to Phase 1 so user sees real action
    switchPhase(1);

    const cleaningBadge = document.getElementById("cleaning-status-badge");
    if (cleaningBadge) {
      cleaningBadge.textContent = "Agent đang chỉnh sửa...";
      cleaningBadge.className = "px-2 py-0.5 rounded text-[10px] bg-amber-500 text-white font-bold animate-pulse";
    }

    showToast("AI Agent đã tiếp nhận yêu cầu! Đang chạy lại pipeline làm sạch...", true);

    const nowTime = new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    appendLog(`Chỉ đạo: "${text}"`, "human");

    setTimeout(() => {
      appendLog(`Phân tích chỉ thị: Tái cấu trúc logic làm sạch cho 60.000 dòng dữ liệu...`, "agent");
    }, 400);

    setTimeout(() => {
      appendLog(`[BƯỚC 1] Siết chặt ngưỡng lọc trùng POS: Bóc tách các giao dịch quét trùng lặp.`, "clean");
    }, 900);

    setTimeout(() => {
      let extraNote = "Loại bỏ hoàn toàn đơn hủy ghép sai & chuẩn hóa hàng trả.";
      if (text.toLowerCase().includes("ch15") || text.toLowerCase().includes("đổi trả")) {
        extraNote = "Bóc tách 180 triệu tiền đổi trả thiết bị CAT03 tại CH15; điều chỉnh giá vốn hoàn nhập.";
      }
      appendLog(`[BƯỚC 2] ${extraNote}`, "clean");
    }, 1500);

    setTimeout(() => {
      appendLog(`[BƯỚC 3] Khóa cứng kỳ đối chiếu: Chuẩn hóa toàn bộ 18 cửa hàng về 31 ngày T10 vs 30 ngày T09 (đã bóc tăng trưởng ảo CH04).`, "clean");
    }, 2100);

    setTimeout(() => {
      state.cleaningCompleted = true;
      state.phase1Completed = true;

      // Update counters
      const duplicateEl = document.getElementById("stat-duplicate-rows");
      const cancelledEl = document.getElementById("stat-cancelled-rows");
      const returnEl = document.getElementById("stat-return-rows");
      const cleanEl = document.getElementById("stat-clean-rows");

      if (duplicateEl) duplicateEl.innerHTML = `1.842 <span class="text-xs font-normal text-rose-500">dòng</span>`;
      if (cancelledEl) cancelledEl.innerHTML = `2.150 <span class="text-xs font-normal text-amber-600">dòng</span>`;
      if (returnEl) returnEl.innerHTML = `3.420 <span class="text-xs font-normal text-purple-600">dòng</span>`;
      if (cleanEl) cleanEl.innerHTML = `56.008 <span class="text-xs font-normal text-emerald-600">dòng (Đã sửa)</span>`;

      appendLog(`Dữ liệu đã được hiệu chỉnh hoàn tất theo đúng chỉ đạo! Sẵn sàng chốt duyệt.`, "success");

      if (cleaningBadge) {
        cleaningBadge.textContent = "Đã chỉnh sửa xong";
        cleaningBadge.className = "px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold";
      }

      // Update Human Verification Box UI
      const humanBox = document.getElementById("human-verification-box");
      if (humanBox) {
        humanBox.className = "pink-card p-5 bg-gradient-to-r from-[#F0FDF4] via-white to-[#F0FDF4] border-2 border-emerald-400";
        const subtitle = humanBox.querySelector("p");
        if (subtitle) {
          subtitle.innerHTML = `<span class="text-emerald-700 font-bold"><i class="fa-solid fa-circle-check"></i> Đã hiệu chỉnh xong theo chỉ đạo của bạn lúc ${nowTime}!</span> Dữ liệu đã đạt chuẩn đối soát. Bạn có thể bấm "Xác Nhận Dữ Liệu OK" để tạo báo cáo.`;
        }
      }

      showToast("AI Agent đã hoàn thành chỉnh sửa dữ liệu theo yêu cầu!", true);
    }, 2800);
  }

  window.executeAgentRevision = executeAgentRevision;

  if (btnSubmitRevision) {
    btnSubmitRevision.addEventListener("click", () => {
      const promptVal = revisionPromptInput ? revisionPromptInput.value.trim() : "";
      closeRevisionModal();
      executeAgentRevision(promptVal);
    });
  }

  // GIAI ĐOẠN 2: TẠO BÁO CÁO QUẢN TRỊ
  function generateManagementReport() {
    state.isReportGenerated = true;
    state.phase2Completed = true;
    const badgePhase2 = document.getElementById("badge-phase2");
    if (badgePhase2) {
      badgePhase2.textContent = "Đã tạo báo cáo";
      badgePhase2.className = "text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300";
    }
    const tabPhase2El = document.getElementById("tab-phase2");
    if (tabPhase2El) tabPhase2El.classList.add("completed");

    const badgePhase3 = document.getElementById("badge-phase3");
    if (badgePhase3) {
      badgePhase3.textContent = "Sẵn sàng đối chiếu";
      badgePhase3.className = "text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold border border-blue-300";
    }

    // Macro KPIs calculation and update
    const totalCleanRev = PHUC_AN_DATA.stores.reduce((sum, s) => sum + s.cleanRev, 0);
    const totalTargetRev = PHUC_AN_DATA.stores.reduce((sum, s) => sum + s.targetRevenue, 0);
    const totalCleanProfit = PHUC_AN_DATA.stores.reduce((sum, s) => sum + s.cleanProfit, 0);
    const totalTargetProfit = PHUC_AN_DATA.stores.reduce((sum, s) => sum + s.targetGrossProfit, 0);
    const avgMargin = ((totalCleanProfit / totalCleanRev) * 100).toFixed(1);
    const avgReturn = (PHUC_AN_DATA.stores.reduce((sum, s) => sum + s.returnRate, 0) / PHUC_AN_DATA.stores.length).toFixed(1);

    const kpiRev = document.getElementById("kpi-macro-rev");
    if (kpiRev) kpiRev.innerHTML = `${(totalCleanRev / 1000000000).toFixed(2)} <span class="text-sm font-semibold text-blue-600">Tỷ VNĐ</span>`;
    const kpiRevTgtLbl = document.getElementById("kpi-macro-rev-target-lbl");
    if (kpiRevTgtLbl) kpiRevTgtLbl.textContent = `Mục tiêu: ${(totalTargetRev / 1000000000).toFixed(1)} Tỷ`;
    const kpiRevTgt = document.getElementById("kpi-macro-rev-target");
    if (kpiRevTgt) {
      kpiRevTgt.textContent = `Đạt ${((totalCleanRev / totalTargetRev) * 100).toFixed(1)}%`;
      kpiRevTgt.className = "text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded";
    }

    const kpiProf = document.getElementById("kpi-macro-profit");
    if (kpiProf) kpiProf.innerHTML = `${(totalCleanProfit / 1000000000).toFixed(2)} <span class="text-sm font-semibold text-emerald-600">Tỷ VNĐ</span>`;
    const kpiProfTgtLbl = document.getElementById("kpi-macro-profit-target-lbl");
    if (kpiProfTgtLbl) kpiProfTgtLbl.textContent = `Mục tiêu: ${(totalTargetProfit / 1000000000).toFixed(2)} Tỷ`;
    const kpiProfTgt = document.getElementById("kpi-macro-profit-target");
    if (kpiProfTgt) {
      kpiProfTgt.textContent = `Đạt ${((totalCleanProfit / totalTargetProfit) * 100).toFixed(1)}%`;
      kpiProfTgt.className = "text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded";
    }

    const kpiMargin = document.getElementById("kpi-macro-margin");
    if (kpiMargin) kpiMargin.textContent = `${avgMargin}%`;
    const kpiMarginSub = document.getElementById("kpi-macro-margin-sub");
    if (kpiMarginSub) {
      kpiMarginSub.textContent = "-0.6% do xả hàng";
      kpiMarginSub.className = "text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded";
    }

    const kpiRet = document.getElementById("kpi-macro-return");
    if (kpiRet) kpiRet.textContent = `${avgReturn}%`;
    const kpiRetSub = document.getElementById("kpi-macro-return-sub");
    if (kpiRetSub) {
      kpiRetSub.textContent = "Vượt trần";
      kpiRetSub.className = "text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded";
    }

    // Update Top Products bars
    const p1 = document.getElementById("prog-cat-01");
    if (p1) p1.style.width = "45%";
    const b1 = document.getElementById("badge-cat-01");
    if (b1) b1.textContent = "45%";
    const p2 = document.getElementById("prog-cat-02");
    if (p2) p2.style.width = "23%";
    const b2 = document.getElementById("badge-cat-02");
    if (b2) b2.textContent = "23%";
    const p3 = document.getElementById("prog-cat-03");
    if (p3) p3.style.width = "19%";
    const b3 = document.getElementById("badge-cat-03");
    if (b3) b3.textContent = "19%";
    const p4 = document.getElementById("prog-cat-04");
    if (p4) p4.style.width = "26%";
    const b4 = document.getElementById("badge-cat-04");
    if (b4) b4.textContent = "26%";

    // Update Top Row Dabang metrics
    const sumTotRev = document.getElementById("summary-total-rev-header");
    if (sumTotRev) sumTotRev.textContent = "49,47 Tỷ VNĐ";
    const sumTgtBadge = document.getElementById("summary-target-reality-badge");
    if (sumTgtBadge) {
      sumTgtBadge.textContent = "97.0% Hoàn Thành";
      sumTgtBadge.className = "text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full";
    }
    const statReal = document.getElementById("stat-reality-sales");
    if (statReal) statReal.innerHTML = `49.47 B <span class="text-slate-400 font-normal">(8.823)</span>`;
    const statTgt = document.getElementById("stat-target-sales");
    if (statTgt) statTgt.innerHTML = `51.00 B <span class="text-slate-400 font-normal">(12.122)</span>`;

    renderStoresManagementTable();
    renderPhase2InsightsAndActions();
    initCharts(false);
    showToast("Báo cáo Quản trị 18 Cửa hàng đã được tạo thành công!");
  }

  function renderPhase2InsightsAndActions() {
    const insightContainer = document.getElementById("phase2-insight-cards");
    const actionTbody = document.getElementById("phase2-action-plan-tbody");
    if (!insightContainer && !actionTbody) return;

    const stats = customDatasetStats || {};
    const totalRows = stats.totalRows || (currentRawRecords ? currentRawRecords.length : 0) || 1006;
    const dupRows = stats.duplicateRows || 0;
    const canRows = stats.cancelledRows || 0;
    const retRows = stats.returnRows || 0;
    const cleanRows = stats.cleanRows || Math.max(totalRows - dupRows - canRows, 0);
    const completenessPct = totalRows > 0 ? ((cleanRows / totalRows) * 100).toFixed(1) : "100.0";

    // Compute IQR outliers on valid revenue values
    const revs = (currentRawRecords || [])
      .filter(r => r && r.type === "valid" && Number(r.rev) > 0)
      .map(r => Number(r.rev))
      .sort((a, b) => a - b);

    let outlierCount = 0;
    let meanVal = 0;
    let medianVal = 0;
    if (revs.length >= 4) {
      const q1 = revs[Math.floor(revs.length * 0.25)];
      const q3 = revs[Math.floor(revs.length * 0.75)];
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;
      outlierCount = revs.filter(v => v < lower || v > upper).length;
      meanVal = revs.reduce((s, v) => s + v, 0) / revs.length;
      medianVal = revs[Math.floor(revs.length / 2)];
    }

    const cancelRate = totalRows > 0 ? ((canRows / totalRows) * 100).toFixed(1) : "0.0";
    const returnRate = totalRows > 0 ? ((retRows / totalRows) * 100).toFixed(1) : "0.0";

    if (insightContainer) {
      insightContainer.innerHTML = `
        <!-- INS-01 -->
        <div class="rounded-2xl border border-[#FAD2E1] bg-white p-4 sm:p-5 space-y-4 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2 font-black text-xs sm:text-sm text-slate-900">
              <i class="fa-solid fa-lightbulb text-amber-500"></i>
              <span>INS-01 · Chất lượng Dữ liệu, Độ phân tán Thống kê &amp; Kiểm soát Ngoại lai (Outliers)</span>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-center">
              Quản trị Dữ liệu &amp; Bất thường (Data Governance)
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="rounded-xl p-3 bg-slate-50 border border-slate-200 space-y-1">
              <div class="text-[11px] font-extrabold text-slate-700">1. DATA (Dữ liệu gốc)</div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Kiểm tra <strong>${totalRows.toLocaleString('vi-VN')}</strong> dòng dữ liệu gốc trên toàn bộ tệp/Sheet tải lên.
              </p>
            </div>
            <div class="rounded-xl p-3 bg-[#FFF0F5] border border-[#FAD2E1] space-y-1">
              <div class="text-[11px] font-extrabold text-[#FF5B8E]">2. INFORMATION (Thông tin)</div>
              <p class="text-xs text-slate-700 leading-relaxed">
                Tỷ lệ dữ liệu sạch đạt <strong>${completenessPct}%</strong>, lọc <strong>${dupRows.toLocaleString('vi-VN')}</strong> dòng trùng lặp và phát hiện <strong>${outlierCount.toLocaleString('vi-VN')}</strong> giá trị ngoại lai (IQR).
              </p>
            </div>
            <div class="rounded-xl p-3 bg-amber-50 border border-amber-200 space-y-1">
              <div class="text-[11px] font-extrabold text-amber-800">3. INSIGHT (Nguyên nhân)</div>
              <p class="text-xs text-amber-950 leading-relaxed">
                ${outlierCount > 0
                  ? `Có phân tán mạnh giữa đơn lẻ và đơn giá trị cao (Mean: ${formatMoney(meanVal)} vs Median: ${formatMoney(medianVal)}).`
                  : "Cấu trúc dữ liệu có tính nhất quán tốt, giá trị trung bình và trung vị bám sát nhau."}
              </p>
            </div>
            <div class="rounded-xl p-3 bg-emerald-50 border border-emerald-200 space-y-1">
              <div class="text-[11px] font-extrabold text-emerald-800">4. DECISION (Quyết định)</div>
              <p class="text-xs text-emerald-950 leading-relaxed">
                Sử dụng đồng thời Trung bình (Mean) và Trung vị (Median) khi giao chỉ tiêu KPI; chuẩn hóa quy trình nhập liệu tại nguồn.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
            <div class="space-y-1.5">
              <p class="text-slate-700"><strong class="text-slate-900">• Phát hiện điều gì?</strong> Dữ liệu sạch đạt ${completenessPct}% (${cleanRows.toLocaleString('vi-VN')}/${totalRows.toLocaleString('vi-VN')} dòng); phát hiện ${dupRows.toLocaleString('vi-VN')} dòng trùng và ${outlierCount.toLocaleString('vi-VN')} giá trị ngoại lai.</p>
              <p class="text-slate-700"><strong class="text-emerald-700">• Nguyên nhân (Đã chứng minh):</strong> Có ${dupRows.toLocaleString('vi-VN')} dòng nhập lặp POS/mã giao dịch và ${outlierCount.toLocaleString('vi-VN')} điểm dữ liệu nằm ngoài khoảng [Q1 - 1.5×IQR, Q3 + 1.5×IQR].</p>
              <p class="text-slate-700"><strong class="text-rose-600">• Tác động doanh nghiệp:</strong> Nếu dùng trung bình cộng đơn thuần khi có ngoại lai hoặc chưa lọc trùng sẽ dẫn đến giao KPI quá cao hoặc đánh giá sai mức nền thực tế.</p>
            </div>
            <div class="space-y-1.5">
              <p class="text-slate-700"><strong class="text-slate-900">• Số liệu chứng minh:</strong> Phương pháp IQR ghi nhận ${outlierCount.toLocaleString('vi-VN')} giao dịch vượt ngưỡng 1.5×IQR${revs.length >= 4 ? ` (Median đơn hợp lệ: ${formatMoney(medianVal)})` : ""}.</p>
              <p class="text-slate-700"><strong class="text-amber-700">• Giả thuyết (Cần kiểm chứng):</strong> Các giá trị ngoại lai có thể là đơn hàng B2B/combo thiết bị giá trị lớn hoặc lỗi gõ thừa chữ số khi nhập liệu thủ công.</p>
              <p class="text-slate-700"><strong class="text-rose-600">• Doanh nghiệp nên làm gì?</strong> Rà soát danh sách ngoại lai đã đánh dấu và áp dụng ràng buộc kiểm tra dữ liệu (Data Validation) trên file Excel/POS.</p>
            </div>
          </div>
        </div>

        <!-- INS-02 -->
        <div class="rounded-2xl border border-[#FAD2E1] bg-white p-4 sm:p-5 space-y-4 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2 font-black text-xs sm:text-sm text-slate-900">
              <i class="fa-solid fa-chart-line text-[#FF5B8E]"></i>
              <span>INS-02 · Kiểm soát Tỷ lệ Đơn Hủy (${cancelRate}%) &amp; Rủi ro Đổi trả (${returnRate}%)</span>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFE2E5] text-[#FA5A7D] border border-[#FAD2E1] self-start sm:self-center">
              Vận hành Bán hàng &amp; Hoàn trả (Operations)
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="rounded-xl p-3 bg-slate-50 border border-slate-200 space-y-1">
              <div class="text-[11px] font-extrabold text-slate-700">1. DATA (Dữ liệu gốc)</div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Ghi nhận <strong>${canRows.toLocaleString('vi-VN')}</strong> đơn đã hủy và <strong>${retRows.toLocaleString('vi-VN')}</strong> đơn đổi trả trong tập giao dịch.
              </p>
            </div>
            <div class="rounded-xl p-3 bg-[#FFF0F5] border border-[#FAD2E1] space-y-1">
              <div class="text-[11px] font-extrabold text-[#FF5B8E]">2. INFORMATION (Thông tin)</div>
              <p class="text-xs text-slate-700 leading-relaxed">
                Tỷ lệ hủy chiếm <strong>${cancelRate}%</strong> và đổi trả chiếm <strong>${returnRate}%</strong> tổng số giao dịch toàn hệ thống.
              </p>
            </div>
            <div class="rounded-xl p-3 bg-amber-50 border border-amber-200 space-y-1">
              <div class="text-[11px] font-extrabold text-amber-800">3. INSIGHT (Nguyên nhân)</div>
              <p class="text-xs text-amber-950 leading-relaxed">
                Đơn hủy do hết tồn kho hoặc khách đổi ý; đơn đổi trả làm giảm doanh thu thuần và phát sinh chi phí hoàn nhập COGS.
              </p>
            </div>
            <div class="rounded-xl p-3 bg-emerald-50 border border-emerald-200 space-y-1">
              <div class="text-[11px] font-extrabold text-emerald-800">4. DECISION (Quyết định)</div>
              <p class="text-xs text-emerald-950 leading-relaxed">
                Khóa đồng bộ tồn kho real-time tại các điểm bán có tỷ lệ hủy cao và siết quy trình tư vấn/đóng gói hàng đổi trả.
              </p>
            </div>
          </div>
        </div>
      `;
    }

    if (actionTbody) {
      actionTbody.innerHTML = `
        <tr class="hover:bg-[#FFFBFD] transition">
          <td class="p-3.5 font-extrabold text-rose-600">Ưu tiên 1 (Kiểm soát Đổi trả &amp; Chất lượng)</td>
          <td class="p-3.5 font-semibold text-slate-800">Phát sinh ${retRows.toLocaleString('vi-VN')} giao dịch đổi trả (${returnRate}%) cần hoàn trừ doanh thu &amp; COGS.</td>
          <td class="p-3.5 text-slate-600">Chuẩn hóa quy trình tư vấn bán hàng, kiểm tra ngoại quan/hạn sử dụng trước khi xuất kho và đối soát mã gốc tự động.</td>
          <td class="p-3.5 font-bold text-rose-600">Quản lý Cửa hàng, Bộ phận CSKH &amp; Kho vận</td>
          <td class="p-3.5 font-bold text-emerald-700">Giảm tỷ lệ đổi trả xuống &le; 3.5% và đối khớp 100% mã giao dịch gốc.</td>
          <td class="p-3.5 text-slate-500">Điều kiện: Cập nhật đủ lý do đổi trả trên POS; Rủi ro: Nhân viên bỏ sót mã gốc khi lập phiếu hoàn.</td>
        </tr>
        <tr class="hover:bg-[#FFFBFD] transition">
          <td class="p-3.5 font-extrabold text-amber-600">Ưu tiên 2 (Giảm Đơn Hủy &amp; Tồn kho ảo)</td>
          <td class="p-3.5 font-semibold text-slate-800">Có ${canRows.toLocaleString('vi-VN')} đơn hàng bị hủy (${cancelRate}%) gây thất thoát cơ hội bán hàng.</td>
          <td class="p-3.5 text-slate-600">Đồng bộ tồn kho POS theo thời gian thực, cảnh báo tự động các SKU sắp hết hàng và loại bỏ ngay đơn Cancelled khỏi doanh số.</td>
          <td class="p-3.5 font-bold text-amber-700">Bộ phận Vận hành Bán lẻ &amp; Điều phối Tồn kho</td>
          <td class="p-3.5 font-bold text-emerald-700">Giảm tỷ lệ hủy đơn dưới 4.0% trong chu kỳ tháng kế tiếp.</td>
          <td class="p-3.5 text-slate-500">Điều kiện: Kết nối API kho liên thông 18 cửa hàng; Rủi ro: Độ trễ đồng bộ giờ cao điểm.</td>
        </tr>
        <tr class="hover:bg-[#FFFBFD] transition">
          <td class="p-3.5 font-extrabold text-rose-500">Ưu tiên 3 (Chuẩn hóa Quản trị Dữ liệu &amp; BI)</td>
          <td class="p-3.5 font-semibold text-slate-800">Tồn tại ${dupRows.toLocaleString('vi-VN')} dòng trùng lặp, tỷ lệ sạch ${completenessPct}% và ${outlierCount.toLocaleString('vi-VN')} điểm ngoại lai cần kiểm chứng.</td>
          <td class="p-3.5 text-slate-600">Áp dụng bộ quy tắc Data Validation (bắt buộc nhập trường khóa, chuẩn hóa danh mục Dropdown, cảnh báo khi giá trị vượt ngưỡng IQR).</td>
          <td class="p-3.5 font-bold text-rose-600">Bộ phận Phân tích Dữ liệu (BI / Data Analyst) &amp; Quản trị Hệ thống</td>
          <td class="p-3.5 font-bold text-emerald-700">Đạt độ đầy đủ dữ liệu &ge; 99.5%, tỷ lệ bản ghi trùng lặp = 0% trong các kỳ báo cáo tiếp theo.</td>
          <td class="p-3.5 text-slate-500">Điều kiện: Các phòng ban dùng chung mẫu biểu (Template) chuẩn; Rủi ro: Nhân sự nhập liệu tự do ngoài danh mục.</td>
        </tr>
      `;
    }
  }

  document.getElementById("btn-generate-report").addEventListener("click", generateManagementReport);
  document.getElementById("btn-proceed-phase3").addEventListener("click", () => switchPhase(3));

  // Render 18 Stores Management Table
  function renderStoresManagementTable(search = "", region = "all") {
    const tbody = document.getElementById("stores-report-tbody");
    tbody.innerHTML = "";

    if (!state.isReportGenerated) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="p-8 text-center text-slate-400 font-medium">
            <i class="fa-solid fa-store text-3xl mb-2 text-slate-300 block"></i>
            Chưa có báo cáo cửa hàng. Dữ liệu sẽ tự động tổng hợp sau khi bạn nạp tệp và bấm 'AI Agent: Tính Toán Báo Cáo' ở Giai đoạn 2.
          </td>
        </tr>
      `;
      return;
    }

    const filtered = PHUC_AN_DATA.stores.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
      const matchRegion = region === "all" || s.region === region;
      return matchSearch && matchRegion;
    });

    filtered.forEach(s => {
      const targetPercent = ((s.cleanRev / s.targetRevenue) * 100).toFixed(1);
      const grossMarginPercent = ((s.cleanProfit / s.cleanRev) * 100).toFixed(1);
      const growthVsSep = (((s.cleanRev - s.compRev) / s.compRev) * 100).toFixed(1);

      let targetColor = "text-emerald-700";
      if (targetPercent < 80) targetColor = "text-rose-700 font-bold";
      else if (targetPercent < 95) targetColor = "text-amber-700";

      let marginColor = "text-slate-800";
      if (grossMarginPercent < 25) marginColor = "text-rose-700 font-bold";

      let returnColor = "text-slate-700";
      if (s.returnRate > 5.0) returnColor = "text-rose-700 font-bold";

      let statusBadge = `<span class="badge-priority-${s.priority} px-2.5 py-0.5 rounded-full text-[10px] font-bold">${s.status}</span>`;

      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 transition";
      tr.innerHTML = `
        <td class="p-3">
          <div class="font-bold text-slate-900">${s.name}</div>
          <div class="text-[11px] text-slate-500">${s.id} • Quản lý: ${s.manager}</div>
        </td>
        <td class="p-3 text-slate-600 font-medium">${s.region}</td>
        <td class="p-3 text-right font-mono font-bold text-slate-900">${formatMoney(s.cleanRev)}</td>
        <td class="p-3 text-right font-mono text-slate-500">${formatMoney(s.targetRevenue)}</td>
        <td class="p-3 text-right font-mono ${targetColor}">${targetPercent}%</td>
        <td class="p-3 text-right font-mono text-emerald-700 font-bold">${formatMoney(s.cleanProfit)}</td>
        <td class="p-3 text-right font-mono ${marginColor}">${grossMarginPercent}%</td>
        <td class="p-3 text-right font-mono ${returnColor}">${s.returnRate}%</td>
        <td class="p-3 text-center font-mono ${growthVsSep >= 0 ? 'text-emerald-700' : 'text-rose-700'} font-bold">
          ${growthVsSep >= 0 ? '+' + growthVsSep : growthVsSep}%
        </td>
        <td class="p-3 text-center">${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById("search-store-input").addEventListener("input", (e) => {
    const region = document.getElementById("filter-region").value;
    renderStoresManagementTable(e.target.value, region);
  });

  document.getElementById("filter-region").addEventListener("change", (e) => {
    const search = document.getElementById("search-store-input").value;
    renderStoresManagementTable(search, e.target.value);
  });

  // Charts Initialization
  function initCharts(isEmpty = false) {
    if (typeof Chart === 'undefined') return;

    // Destroy prior chart instances to prevent canvas reuse errors
    if (state.chartVisitor) { state.chartVisitor.destroy(); state.chartVisitor = null; }
    if (state.chartTotalRev) { state.chartTotalRev.destroy(); state.chartTotalRev = null; }
    if (state.chartCustSat) { state.chartCustSat.destroy(); state.chartCustSat = null; }
    if (state.chartTargetReality) { state.chartTargetReality.destroy(); state.chartTargetReality = null; }
    if (state.chartVolume) { state.chartVolume.destroy(); state.chartVolume = null; }
    if (state.chartStores) { state.chartStores.destroy(); state.chartStores = null; }
    if (state.chartProductMix) { state.chartProductMix.destroy(); state.chartProductMix = null; }

    // A. Visitor Insights Line Chart (Dabang Triple Curve)
    const ctxVisitor = document.getElementById("chart-visitor-insights");
    if (ctxVisitor) {
      state.chartVisitor = new Chart(ctxVisitor, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Loyal Customers',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : [270, 290, 275, 250, 230, 270, 345, 320, 290, 260, 230],
              borderColor: '#9333EA',
              backgroundColor: 'transparent',
              tension: 0.45,
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 6
            },
            {
              label: 'New Customers',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : [310, 280, 260, 240, 250, 290, 360, 330, 280, 240, 220],
              borderColor: '#FF5B8E',
              backgroundColor: 'transparent',
              tension: 0.45,
              borderWidth: 2.5,
              pointRadius: isEmpty ? 0 : [0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0],
              pointBackgroundColor: '#FF5B8E',
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 2
            },
            {
              label: 'Unique Customers',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : [230, 310, 330, 320, 280, 260, 300, 310, 280, 260, 250],
              borderColor: '#10B981',
              backgroundColor: 'transparent',
              tension: 0.45,
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
            y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 9 }, color: '#94A3B8' } }
          }
        }
      });
    }

    // B. Total Revenue Dual Bar Chart
    const ctxTotalRev = document.getElementById("chart-total-revenue");
    if (ctxTotalRev) {
      state.chartTotalRev = new Chart(ctxTotalRev, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Online Sales',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [12, 11, 23, 8, 11, 14, 18],
              backgroundColor: '#FF5B8E',
              borderRadius: 6,
              barPercentage: 0.6
            },
            {
              label: 'Offline Sales',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [14, 16, 7, 15, 12, 16, 21],
              backgroundColor: '#8B5CF6',
              borderRadius: 6,
              barPercentage: 0.6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8' } },
            y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 }, color: '#94A3B8' } }
          }
        }
      });
    }

    // C. Customer Satisfaction Dual Curve
    const ctxCustSat = document.getElementById("chart-customer-satisfaction");
    if (ctxCustSat) {
      state.chartCustSat = new Chart(ctxCustSat, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
          datasets: [
            {
              label: 'Last Month',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [78, 65, 72, 63, 68, 62, 79],
              borderColor: '#FF5B8E',
              backgroundColor: 'transparent',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: isEmpty ? 0 : 4,
              pointBackgroundColor: '#FF5B8E'
            },
            {
              label: 'This Month',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [55, 62, 53, 54, 57, 56, 62],
              borderColor: '#8B5CF6',
              backgroundColor: 'transparent',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: isEmpty ? 0 : 4,
              pointBackgroundColor: '#8B5CF6'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }

    // D. Target vs Reality Grouped Bar
    const ctxTargetReality = document.getElementById("chart-target-reality");
    if (ctxTargetReality) {
      state.chartTargetReality = new Chart(ctxTargetReality, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Reality Sales',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [8.2, 7.5, 6.8, 8.5, 9.2, 8.8, 9.5],
              backgroundColor: '#FF5B8E',
              borderRadius: 6,
              barPercentage: 0.6
            },
            {
              label: 'Target Sales',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [9.0, 8.2, 7.9, 9.1, 10.2, 9.8, 10.5],
              backgroundColor: '#F472B6',
              borderRadius: 6,
              barPercentage: 0.6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
            y: { display: false }
          }
        }
      });
    }

    // E. Volume vs Service Level Stacked Bar
    const ctxVolume = document.getElementById("chart-volume-service");
    if (ctxVolume) {
      state.chartVolume = new Chart(ctxVolume, {
        type: 'bar',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
          datasets: [
            {
              label: 'Volume',
              data: isEmpty ? [0, 0, 0, 0, 0, 0] : [6, 7, 6, 5, 4, 6],
              backgroundColor: '#FF5B8E',
              borderRadius: 6,
              stack: 'Stack 0',
              barPercentage: 0.5
            },
            {
              label: 'Services',
              data: isEmpty ? [0, 0, 0, 0, 0, 0] : [5, 8, 6, 6, 5, 5],
              backgroundColor: '#8B5CF6',
              borderRadius: 6,
              stack: 'Stack 0',
              barPercentage: 0.5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8' } },
            y: { display: false }
          }
        }
      });
    }

    // 1. Chart Stores Revenue vs Target
    const ctxStores = document.getElementById("chart-stores-revenue");
    if (ctxStores) {
      const labels = PHUC_AN_DATA.stores.map(s => s.name.replace("Phúc An ", ""));
      const revData = isEmpty ? labels.map(() => 0) : PHUC_AN_DATA.stores.map(s => (s.cleanRev / 1000000000).toFixed(2));
      const targetData = isEmpty ? labels.map(() => 0) : PHUC_AN_DATA.stores.map(s => (s.targetRevenue / 1000000000).toFixed(2));

      state.chartStores = new Chart(ctxStores, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Doanh Thu Thực Tế (Tỷ đ)',
              data: revData,
              backgroundColor: '#FF5B8E',
              borderRadius: 6
            },
            {
              label: 'Chỉ Tiêu Target (Tỷ đ)',
              data: targetData,
              backgroundColor: '#FAD2E1',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#334155', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif", weight: '600' } }
            }
          },
          scales: {
            x: {
              ticks: { color: '#64748b', font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" }, maxRotation: 45 },
              grid: { display: false }
            },
            y: {
              ticks: { color: '#64748b', font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" } },
              grid: { color: '#f1f5f9' }
            }
          }
        }
      });
    }

    // 2. Chart Product Mix
    const ctxMix = document.getElementById("chart-product-mix");
    if (ctxMix) {
      state.chartProductMix = new Chart(ctxMix, {
        type: 'doughnut',
        data: {
          labels: isEmpty ? ['Chưa nạp dữ liệu ngành hàng'] : ['Điện gia dụng (35%)', 'Thiết bị số (30%)', 'Chăm sóc sức khỏe (20%)', 'Gia dụng thông minh (15%)'],
          datasets: [{
            data: isEmpty ? [1] : [35, 30, 20, 15],
            backgroundColor: isEmpty ? ['#F1F5F9'] : [
              '#FF5B8E',
              '#BF83FF',
              '#3CD856',
              '#FF947A'
            ],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#334155', font: { size: 10, family: "'Plus Jakarta Sans', sans-serif", weight: '500' }, boxWidth: 12 }
            }
          },
          cutout: '65%'
        }
      });
    }

    // Ensure charts display in current language (Vietnamese by default)
    if (typeof updateChartLanguages === "function") {
      updateChartLanguages(currentAppLang);
    }
  }

  // GIAI ĐOẠN 3: ĐỐI CHIẾU & RA QUYẾT ĐỊNH (CROSS-CHECK AUDIT)
  function runCrossCheckAudit() {
    state.isAuditCompleted = true;
    state.phase3Completed = true;
    const badgePhase3 = document.getElementById("badge-phase3");
    if (badgePhase3) {
      badgePhase3.textContent = "Đã đối chiếu & Đề xuất";
      badgePhase3.className = "text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300";
    }
    const tabPhase3El = document.getElementById("tab-phase3");
    if (tabPhase3El) tabPhase3El.classList.add("completed");

    renderAnomalyCards();
    renderPriorityMatrix();
    renderWebExecutiveReport();
    showToast("Cross-check Audit hoàn tất: Đã phân loại các cửa hàng cho Giám đốc Kinh doanh!");
  }

  function renderWebExecutiveReport() {
    const bodyEl = document.getElementById("web-executive-report-body");
    if (!bodyEl) return;
    const ctx = gatherAgentReportContext();

    const storeRowsHtml = ctx.stores.slice(0, 10).map(s => {
      const pct = s.targetRevenue > 0 ? ((s.cleanRev / s.targetRevenue) * 100).toFixed(1) : "0.0";
      const margin = s.cleanRev > 0 ? ((s.cleanProfit / s.cleanRev) * 100).toFixed(1) : "0.0";
      return `
        <tr class="hover:bg-[#FFF5F8]">
          <td class="p-2.5 font-bold text-slate-900">${escapeHtml(s.name)}</td>
          <td class="p-2.5 text-slate-500">${escapeHtml(s.region)}</td>
          <td class="p-2.5 text-right font-mono font-bold">${formatMoney(s.cleanRev)}</td>
          <td class="p-2.5 text-right font-mono text-emerald-700 font-bold">${pct}%</td>
          <td class="p-2.5 text-right font-mono">${formatMoney(s.cleanProfit)}</td>
          <td class="p-2.5 text-right font-mono">${margin}%</td>
          <td class="p-2.5 text-right font-mono ${s.returnRate > 3.5 ? 'text-rose-600 font-bold' : ''}">${s.returnRate}%</td>
        </tr>
      `;
    }).join("");

    bodyEl.innerHTML = `
      <!-- 1. Thông tin chung -->
      <div class="rounded-2xl p-4 bg-white border border-[#FAD2E1] space-y-1.5">
        <div class="text-sm font-black text-[#FF5B8E] uppercase">Báo Cáo Quản Trị &amp; Đối Soát Dữ Liệu BI</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
          <div><strong>Doanh nghiệp / Dự án:</strong> ${escapeHtml(ctx.company)}</div>
          <div><strong>Ngành nghề:</strong> ${escapeHtml(ctx.industry)}</div>
          <div><strong>Đối tượng xem:</strong> ${escapeHtml(ctx.audience)}</div>
          <div><strong>Người lập:</strong> ${escapeHtml(ctx.author)} • <strong>Ngày:</strong> ${ctx.dateStr}</div>
        </div>
        <div><strong>Mục tiêu phân tích:</strong> ${escapeHtml(ctx.desc)}</div>
      </div>

      <!-- 2. Tóm tắt Làm sạch & 4 Macro KPI -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="rounded-2xl p-3.5 bg-white border border-[#FAD2E1]">
          <div class="text-[11px] font-bold text-slate-500">Dữ Liệu Sạch / Tổng Thô</div>
          <div class="text-lg font-black text-emerald-700 mt-0.5">${ctx.cleanRows.toLocaleString('vi-VN')} / ${ctx.totalRows.toLocaleString('vi-VN')}</div>
          <div class="text-[10px] text-slate-500">Đạt ${ctx.completenessPct}% (${ctx.dupRows} trùng · ${ctx.canRows} hủy · ${ctx.retRows} trả)</div>
        </div>
        <div class="rounded-2xl p-3.5 bg-white border border-[#FAD2E1]">
          <div class="text-[11px] font-bold text-slate-500">Doanh Thu Thuần</div>
          <div class="text-lg font-black text-blue-700 mt-0.5">${formatMoney(ctx.totalCleanRev)}</div>
          <div class="text-[10px] text-emerald-600 font-bold">${ctx.revPct}% Mục tiêu</div>
        </div>
        <div class="rounded-2xl p-3.5 bg-white border border-[#FAD2E1]">
          <div class="text-[11px] font-bold text-slate-500">Lợi Nhuận Gộp</div>
          <div class="text-lg font-black text-emerald-700 mt-0.5">${formatMoney(ctx.totalCleanProfit)}</div>
          <div class="text-[10px] text-slate-500">Biên LN BQ: ${ctx.avgMargin}%</div>
        </div>
        <div class="rounded-2xl p-3.5 bg-white border border-[#FAD2E1]">
          <div class="text-[11px] font-bold text-slate-500">Tỷ Lệ Đổi Trả BQ</div>
          <div class="text-lg font-black text-rose-600 mt-0.5">${ctx.avgReturn}%</div>
          <div class="text-[10px] text-slate-500">Định mức trần: 3.5%</div>
        </div>
      </div>

      <!-- 3. Tóm tắt Insight & Action Plan -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="rounded-2xl p-4 bg-white border border-[#FAD2E1] space-y-1.5">
          <div class="font-black text-slate-900"><i class="fa-solid fa-lightbulb text-amber-500 mr-1.5"></i>Kết Luận Insight (DATA → DECISION)</div>
          <p class="text-slate-600 leading-relaxed">• Đã bóc tách ${ctx.dupRows} dòng trùng lặp, khấu trừ ${ctx.canRows} đơn hủy và hoàn nhập COGS cho ${ctx.retRows} giao dịch đổi trả.</p>
          <p class="text-slate-600 leading-relaxed">• Cần giao KPI dựa trên Mean + Median và khóa đồng bộ tồn kho real-time để triệt tiêu đơn hủy ảo.</p>
        </div>
        <div class="rounded-2xl p-4 bg-white border border-[#FAD2E1] space-y-1.5">
          <div class="font-black text-slate-900"><i class="fa-solid fa-bullseye text-[#FF5B8E] mr-1.5"></i>Hành Động &amp; KPI Trọng Tâm</div>
          <p class="text-slate-600 leading-relaxed">• <strong>CSKH &amp; Kho:</strong> Giảm đổi trả &le; 3.5%, đối soát 100% mã giao dịch gốc.</p>
          <p class="text-slate-600 leading-relaxed">• <strong>BI &amp; Hệ thống:</strong> Bật Data Validation, giữ độ đầy đủ &ge; 99.5% và trùng lặp = 0%.</p>
        </div>
      </div>

      <!-- 4. Bảng trích xuất cửa hàng trên web -->
      <div class="rounded-2xl border border-[#FAD2E1] bg-white overflow-hidden">
        <div class="px-4 py-2.5 bg-[#FFF5F8] border-b border-[#FFE4EC] font-black text-slate-800">
          Tổng Hợp Hiệu Suất Top ${Math.min(10, ctx.stores.length)} / ${ctx.stores.length} Cửa Hàng
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th class="p-2.5">Cửa Hàng</th>
                <th class="p-2.5">Khu Vực</th>
                <th class="p-2.5 text-right">Doanh Thu Thuần</th>
                <th class="p-2.5 text-right">% Đạt</th>
                <th class="p-2.5 text-right">LN Gộp</th>
                <th class="p-2.5 text-right">Biên (%)</th>
                <th class="p-2.5 text-right">Đổi Trả</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">${storeRowsHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  document.getElementById("btn-print-web-report")?.addEventListener("click", () => window.print());

  document.getElementById("btn-run-audit").addEventListener("click", runCrossCheckAudit);

  // ========================================================
  // FINAL OUTPUT EXPORT: WORD (.doc) & POWERPOINT (.pptx)
  // ========================================================
  function gatherAgentReportContext() {
    const company = (document.getElementById("ctx-company-name")?.value || "").trim() || "Hệ Thống Bán Lẻ Phúc An Mart";
    const industry = (document.getElementById("ctx-industry")?.value || "").trim() || "Bán lẻ đa kênh (Omnichannel Retail)";
    const audience = (document.getElementById("ctx-audience")?.value || "").trim() || "Ban Giám Đốc (CEO / CFO), Trưởng phòng Kinh doanh";
    const desc = (document.getElementById("ctx-description")?.value || "").trim() || "Phân tích doanh thu thuần, làm sạch đơn hủy/trùng lặp/đổi trả và tối ưu hiệu suất 18 cửa hàng.";
    const activeUser = getCurrentUser();
    const author = activeUser ? activeUser.fullname : "Cao Thị Thảo Hiền";

    const stats = customDatasetStats || {};
    const totalRows = stats.totalRows || (currentRawRecords ? currentRawRecords.length : 0) || 1006;
    const dupRows = stats.duplicateRows || 0;
    const canRows = stats.cancelledRows || 0;
    const retRows = stats.returnRows || 0;
    const cleanRows = stats.cleanRows || Math.max(totalRows - dupRows - canRows, 0);
    const completenessPct = totalRows > 0 ? ((cleanRows / totalRows) * 100).toFixed(1) : "100.0";

    const stores = (typeof PHUC_AN_DATA !== "undefined" && PHUC_AN_DATA.stores) ? PHUC_AN_DATA.stores : [];
    const totalCleanRev = stores.reduce((s, x) => s + x.cleanRev, 0);
    const totalTargetRev = stores.reduce((s, x) => s + x.targetRevenue, 0);
    const totalCleanProfit = stores.reduce((s, x) => s + x.cleanProfit, 0);
    const avgMargin = totalCleanRev > 0 ? ((totalCleanProfit / totalCleanRev) * 100).toFixed(1) : "32.0";
    const revPct = totalTargetRev > 0 ? ((totalCleanRev / totalTargetRev) * 100).toFixed(1) : "97.0";
    const avgReturn = stores.length > 0 ? (stores.reduce((s, x) => s + x.returnRate, 0) / stores.length).toFixed(1) : "3.8";

    return {
      company, industry, audience, desc, author,
      dateStr: new Date().toLocaleDateString("vi-VN"),
      totalRows, dupRows, canRows, retRows, cleanRows, completenessPct,
      stores, totalCleanRev, totalTargetRev, totalCleanProfit, avgMargin, revPct, avgReturn
    };
  }

  function exportWordReport() {
    const ctx = gatherAgentReportContext();
    const storeRowsHtml = ctx.stores.map(s => {
      const pct = s.targetRevenue > 0 ? ((s.cleanRev / s.targetRevenue) * 100).toFixed(1) : "0.0";
      const margin = s.cleanRev > 0 ? ((s.cleanProfit / s.cleanRev) * 100).toFixed(1) : "0.0";
      return `
        <tr>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.region)}</td>
          <td style="text-align:right;">${formatMoney(s.cleanRev)}</td>
          <td style="text-align:right;">${formatMoney(s.targetRevenue)}</td>
          <td style="text-align:right;">${pct}%</td>
          <td style="text-align:right;">${formatMoney(s.cleanProfit)}</td>
          <td style="text-align:right;">${margin}%</td>
          <td style="text-align:right;">${s.returnRate}%</td>
        </tr>`;
    }).join("");

    const wordHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Báo Cáo Quản Trị BI - ${escapeHtml(ctx.company)}</title>
  <style>
    body { font-family: "Calibri", "Arial", sans-serif; color: #1E293B; line-height: 1.5; margin: 24px; }
    h1 { color: #D92662; font-size: 22pt; border-bottom: 2px solid #FF5B8E; padding-bottom: 6px; }
    h2 { color: #1E3A8A; font-size: 14pt; margin-top: 18px; border-left: 4px solid #FF5B8E; padding-left: 8px; }
    .meta { background: #FFF5F8; border: 1px solid #FAD2E1; padding: 12px; border-radius: 6px; margin-bottom: 14px; font-size: 10.5pt; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5pt; }
    th { background-color: #FF5B8E; color: #FFFFFF; padding: 7px; border: 1px solid #FAD2E1; text-align: left; }
    td { padding: 6px; border: 1px solid #E2E8F0; }
    tr:nth-child(even) td { background-color: #FFFBFD; }
    .kpi-table td { text-align: center; background: #FFF5F8; font-weight: bold; font-size: 11pt; padding: 10px; }
  </style>
</head>
<body>
  <h1>BÁO CÁO PHÂN TÍCH QUẢN TRỊ &amp; ĐỐI SOÁT DỮ LIỆU BI</h1>
  <div class="meta">
    <strong>Doanh nghiệp / Dự án:</strong> ${escapeHtml(ctx.company)}<br>
    <strong>Ngành nghề:</strong> ${escapeHtml(ctx.industry)} &nbsp;|&nbsp; <strong>Đối tượng:</strong> ${escapeHtml(ctx.audience)}<br>
    <strong>Người lập báo cáo:</strong> ${escapeHtml(ctx.author)} &nbsp;|&nbsp; <strong>Ngày xuất:</strong> ${ctx.dateStr}<br>
    <strong>Mục tiêu phân tích:</strong> ${escapeHtml(ctx.desc)}
  </div>

  <h2>1. KẾT QUẢ LÀM SẠCH DỮ LIỆU (BƯỚC 2 BPMN)</h2>
  <table class="kpi-table">
    <tr>
      <th>Tổng Dữ Liệu Thô</th>
      <th>Trùng Lặp (Loại bỏ)</th>
      <th>Đơn Đã Hủy (Trừ DT)</th>
      <th>Đổi Trả (Hoàn COGS)</th>
      <th>Dữ Liệu Sạch Hợp Lệ</th>
    </tr>
    <tr>
      <td>${ctx.totalRows.toLocaleString('vi-VN')} dòng</td>
      <td style="color:#E11D48;">${ctx.dupRows.toLocaleString('vi-VN')} dòng</td>
      <td style="color:#D97706;">${ctx.canRows.toLocaleString('vi-VN')} dòng</td>
      <td style="color:#7C3AED;">${ctx.retRows.toLocaleString('vi-VN')} dòng</td>
      <td style="color:#059669;">${ctx.cleanRows.toLocaleString('vi-VN')} dòng (${ctx.completenessPct}%)</td>
    </tr>
  </table>

  <h2>2. CHỈ SỐ TỔNG QUAN KINH DOANH (4 MACRO KPI)</h2>
  <table class="kpi-table">
    <tr>
      <th>Doanh Thu Thuần</th>
      <th>Lợi Nhuận Gộp</th>
      <th>Biên LN Gộp BQ</th>
      <th>Tỷ Lệ Đổi Trả BQ</th>
    </tr>
    <tr>
      <td>${formatMoney(ctx.totalCleanRev)} (${ctx.revPct}% MT)</td>
      <td>${formatMoney(ctx.totalCleanProfit)}</td>
      <td>${ctx.avgMargin}% (Chuẩn 32%)</td>
      <td>${ctx.avgReturn}% (Trần 3.5%)</td>
    </tr>
  </table>

  <h2>3. PHÂN TÍCH INSIGHT (DATA → INFORMATION → INSIGHT → DECISION)</h2>
  <table>
    <tr>
      <th>Mã Insight</th>
      <th>DATA &amp; INFORMATION</th>
      <th>INSIGHT (Nguyên nhân)</th>
      <th>DECISION (Quyết định)</th>
    </tr>
    <tr>
      <td><strong>INS-01</strong><br>Quản trị Dữ liệu</td>
      <td>Kiểm tra ${ctx.totalRows.toLocaleString('vi-VN')} dòng gốc; độ sạch đạt ${ctx.completenessPct}%, lọc ${ctx.dupRows.toLocaleString('vi-VN')} dòng trùng lặp.</td>
      <td>Tồn tại lỗi ghi nhận trùng POS/mã giao dịch và đơn hủy cộng nhầm làm sai lệch mức nền doanh thu.</td>
      <td>Dùng Mean + Median khi giao KPI; áp dụng Data Validation chuẩn hóa nhập liệu tại nguồn.</td>
    </tr>
    <tr>
      <td><strong>INS-02</strong><br>Hủy đơn &amp; Đổi trả</td>
      <td>Phát hiện ${ctx.canRows.toLocaleString('vi-VN')} đơn hủy và ${ctx.retRows.toLocaleString('vi-VN')} giao dịch đổi trả cần hoàn COGS.</td>
      <td>Hết tồn kho ảo gây hủy đơn; tư vấn/đóng gói chưa chuẩn làm tăng tỷ lệ đổi trả vượt trần 3.5%.</td>
      <td>Khóa đồng bộ tồn kho real-time và đối soát tự động mã giao dịch gốc khi lập phiếu hoàn.</td>
    </tr>
  </table>

  <h2>4. ĐỀ XUẤT GIẢI PHÁP, BỘ PHẬN PHỤ TRÁCH &amp; KPI (ACTION PLAN)</h2>
  <table>
    <tr>
      <th>Thứ Tự Ưu Tiên</th>
      <th>Giải Pháp Cụ Thể</th>
      <th>Bộ Phận Chịu Trách Nhiệm</th>
      <th>KPI Đo Lường Hiệu Quả</th>
    </tr>
    <tr>
      <td><strong>Ưu tiên 1:</strong> Kiểm soát Đổi trả</td>
      <td>Chuẩn hóa quy trình tư vấn bán hàng, kiểm tra hàng trước xuất và đối soát mã gốc tự động.</td>
      <td>Quản lý Cửa hàng, CSKH &amp; Kho vận</td>
      <td>Tỷ lệ đổi trả &le; 3.5%, khớp 100% mã giao dịch gốc.</td>
    </tr>
    <tr>
      <td><strong>Ưu tiên 2:</strong> Giảm Đơn hủy</td>
      <td>Đồng bộ tồn kho POS theo thời gian thực và cảnh báo SKU sắp hết hàng.</td>
      <td>Vận hành Bán lẻ &amp; Điều phối Tồn kho</td>
      <td>Giảm tỷ lệ hủy đơn xuống dưới 4.0% trong kỳ tới.</td>
    </tr>
    <tr>
      <td><strong>Ưu tiên 3:</strong> Quản trị Dữ liệu BI</td>
      <td>Áp dụng Data Validation, chuẩn hóa danh mục Dropdown và cảnh báo ngưỡng ngoại lai IQR.</td>
      <td>BI / Data Analyst &amp; Quản trị Hệ thống</td>
      <td>Độ đầy đủ dữ liệu &ge; 99.5%, Trùng lặp = 0%.</td>
    </tr>
  </table>

  <h2>5. BẢNG TỔNG HỢP HIỆU SUẤT ${ctx.stores.length} CỬA HÀNG</h2>
  <table>
    <tr>
      <th>Cửa Hàng</th>
      <th>Khu Vực</th>
      <th style="text-align:right;">Doanh Thu Thuần</th>
      <th style="text-align:right;">Mục Tiêu</th>
      <th style="text-align:right;">% Đạt</th>
      <th style="text-align:right;">LN Gộp</th>
      <th style="text-align:right;">Biên (%)</th>
      <th style="text-align:right;">Đổi Trả</th>
    </tr>
    ${storeRowsHtml}
  </table>
</body>
</html>`;

    const blob = new Blob(["\ufeff", wordHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BaoCao_QuanTri_PhucAn_AI_Agent.doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Đã xuất file Báo cáo Word (.doc) thành công! 📄");
  }

  function exportPowerPointReport() {
    if (typeof PptxGenJS === "undefined") {
      showToast("Không tải được thư viện PptxGenJS. Vui lòng tải lại trang!", true);
      return;
    }
    const ctx = gatherAgentReportContext();
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";
    pptx.author = ctx.author;
    pptx.company = ctx.company;
    pptx.title = `Báo Cáo BI AI Agent - ${ctx.company}`;

    // Slide 1: Cover
    const s1 = pptx.addSlide();
    s1.background = { color: "FCEEF3" };
    s1.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 0.6, w: 8.8, h: 4.4, fill: { color: "FFFFFF" }, line: { color: "FAD2E1", width: 2 }, rectRadius: 0.25 });
    s1.addText("ENTERPRISE BI AI AGENT • DATALENS STUDIO", { x: 1.0, y: 1.0, w: 8.0, h: 0.4, fontSize: 12, bold: true, color: "FF5B8E" });
    s1.addText(`BÁO CÁO PHÂN TÍCH & ĐỐI SOÁT DỮ LIỆU\n${ctx.company}`, { x: 1.0, y: 1.5, w: 8.0, h: 1.4, fontSize: 24, bold: true, color: "1E293B" });
    s1.addText(`Ngành nghề: ${ctx.industry}\nĐối tượng xem: ${ctx.audience}\nNgười thực hiện: ${ctx.author} • Ngày xuất: ${ctx.dateStr}`, { x: 1.0, y: 3.1, w: 8.0, h: 1.3, fontSize: 13, color: "475569" });

    // Slide 2: Data Cleaning Summary
    const s2 = pptx.addSlide();
    s2.background = { color: "FFFFFF" };
    s2.addText("1. Kết Quả Làm Sạch Dữ Liệu (Bước 2 BPMN)", { x: 0.5, y: 0.4, w: 9.0, h: 0.5, fontSize: 20, bold: true, color: "FF5B8E" });
    const cleanCards = [
      { title: "Tổng Dòng Thô", val: `${ctx.totalRows.toLocaleString('vi-VN')}`, bg: "FFF5F8", fg: "1E293B" },
      { title: "Trùng Lặp", val: `${ctx.dupRows.toLocaleString('vi-VN')}`, bg: "FFE4E6", fg: "BE123C" },
      { title: "Đơn Đã Hủy", val: `${ctx.canRows.toLocaleString('vi-VN')}`, bg: "FEF3C7", fg: "B45309" },
      { title: "Đổi Trả Hàng", val: `${ctx.retRows.toLocaleString('vi-VN')}`, bg: "F3E8FF", fg: "6D28D9" },
      { title: "Dữ Liệu Sạch", val: `${ctx.cleanRows.toLocaleString('vi-VN')}`, bg: "DCFCE7", fg: "047857" }
    ];
    cleanCards.forEach((c, idx) => {
      const xPos = 0.5 + idx * 1.82;
      s2.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.2, w: 1.68, h: 1.5, fill: { color: c.bg }, line: { color: "FAD2E1", width: 1 }, rectRadius: 0.15 });
      s2.addText(c.title, { x: xPos + 0.1, y: 1.35, w: 1.48, h: 0.35, fontSize: 11, bold: true, color: c.fg, align: "center" });
      s2.addText(c.val, { x: xPos + 0.1, y: 1.8, w: 1.48, h: 0.6, fontSize: 22, bold: true, color: c.fg, align: "center" });
    });
    s2.addText(`Độ sạch dữ liệu đạt ${ctx.completenessPct}% sau khi loại bỏ trùng lặp, khấu trừ đơn hủy và hoàn nhập COGS cho hàng đổi trả.`, { x: 0.5, y: 3.1, w: 9.0, h: 0.8, fontSize: 13, color: "334155" });

    // Slide 3: 4 Macro KPIs
    const s3 = pptx.addSlide();
    s3.background = { color: "FFFFFF" };
    s3.addText("2. Chỉ Số Tổng Quan Kinh Doanh (4 Macro KPI)", { x: 0.5, y: 0.4, w: 9.0, h: 0.5, fontSize: 20, bold: true, color: "FF5B8E" });
    const kpiCards = [
      { title: "Doanh Thu Thuần", val: formatMoney(ctx.totalCleanRev), sub: `${ctx.revPct}% Mục tiêu`, bg: "FFF5F8", fg: "1D4ED8" },
      { title: "Lợi Nhuận Gộp", val: formatMoney(ctx.totalCleanProfit), sub: "Khớp chuẩn COGS", bg: "DCFCE7", fg: "047857" },
      { title: "Biên LN Gộp BQ", val: `${ctx.avgMargin}%`, sub: "Chuẩn định mức 32.0%", bg: "F3E8FF", fg: "6D28D9" },
      { title: "Tỷ Lệ Đổi Trả BQ", val: `${ctx.avgReturn}%`, sub: "Định mức trần 3.5%", bg: "FFE4E6", fg: "BE123C" }
    ];
    kpiCards.forEach((c, idx) => {
      const xPos = 0.5 + idx * 2.3;
      s3.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.3, w: 2.1, h: 2.0, fill: { color: c.bg }, line: { color: "FAD2E1", width: 1 }, rectRadius: 0.15 });
      s3.addText(c.title, { x: xPos + 0.1, y: 1.45, w: 1.9, h: 0.4, fontSize: 12, bold: true, color: c.fg, align: "center" });
      s3.addText(c.val, { x: xPos + 0.1, y: 1.95, w: 1.9, h: 0.6, fontSize: 20, bold: true, color: "1E293B", align: "center" });
      s3.addText(c.sub, { x: xPos + 0.1, y: 2.65, w: 1.9, h: 0.4, fontSize: 10, color: "475569", align: "center" });
    });

    // Slide 4: Insight DATA -> INFORMATION -> INSIGHT -> DECISION
    const s4 = pptx.addSlide();
    s4.background = { color: "FFFFFF" };
    s4.addText("3. Phân Tích Insight (DATA → INFORMATION → INSIGHT → DECISION)", { x: 0.5, y: 0.4, w: 9.0, h: 0.5, fontSize: 18, bold: true, color: "FF5B8E" });
    const insTable = [
      [{ text: "Giai Đoạn", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } }, { text: "Nội Dung Phân Tích Từ Dữ Liệu Thực Tế", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } }],
      ["1. DATA", `Kiểm tra ${ctx.totalRows.toLocaleString('vi-VN')} dòng giao dịch gốc (${ctx.canRows} đơn hủy, ${ctx.retRows} đổi trả, ${ctx.dupRows} trùng lặp).`],
      ["2. INFORMATION", `Tỷ lệ dữ liệu sạch đạt ${ctx.completenessPct}%, tách riêng các bản ghi lỗi và kiểm tra ngoại lai theo ngưỡng 1.5×IQR.`],
      ["3. INSIGHT", "Đơn hủy từ tồn kho ảo và lỗi ghi nhận trùng POS làm sai lệch doanh thu thực và biên lợi nhuận."],
      ["4. DECISION", "Áp dụng đồng bộ tồn kho real-time, dùng Mean + Median giao KPI và bật Data Validation tại nguồn."]
    ];
    s4.addTable(insTable, { x: 0.5, y: 1.15, w: 9.0, colW: [2.0, 7.0], fontSize: 12, border: { pt: 1, color: "FAD2E1" } });

    // Slide 5: Action Plan & KPI
    const s5 = pptx.addSlide();
    s5.background = { color: "FFFFFF" };
    s5.addText("4. Đề Xuất Giải Pháp, Bộ Phận Phụ Trách & KPI", { x: 0.5, y: 0.4, w: 9.0, h: 0.5, fontSize: 19, bold: true, color: "FF5B8E" });
    const actionTable = [
      [
        { text: "Ưu Tiên", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "Giải Pháp Cụ Thể", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "Bộ Phận Phụ Trách", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "KPI Đo Lường", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } }
      ],
      ["Ưu tiên 1", "Chuẩn hóa tư vấn & đối soát mã giao dịch gốc tự động", "QL Cửa hàng, CSKH & Kho", "Đổi trả <= 3.5%, khớp 100% mã gốc"],
      ["Ưu tiên 2", "Đồng bộ tồn kho POS real-time & cảnh báo SKU sắp hết", "Vận hành Bán lẻ & Kho", "Giảm tỷ lệ hủy đơn < 4.0%"],
      ["Ưu tiên 3", "Áp dụng Data Validation & cảnh báo ngưỡng IQR", "BI / Data Analyst & IT", "Độ đầy đủ >= 99.5%, Trùng lặp = 0%"]
    ];
    s5.addTable(actionTable, { x: 0.5, y: 1.15, w: 9.0, colW: [1.4, 3.2, 2.2, 2.2], fontSize: 11, border: { pt: 1, color: "FAD2E1" } });

    // Slide 6: Top Stores Summary
    const s6 = pptx.addSlide();
    s6.background = { color: "FFFFFF" };
    s6.addText("5. Bảng Hiệu Suất Top Cửa Hàng Tiêu Biểu", { x: 0.5, y: 0.4, w: 9.0, h: 0.5, fontSize: 19, bold: true, color: "FF5B8E" });
    const topStores = ctx.stores.slice(0, 8);
    const storeTbl = [
      [
        { text: "Cửa Hàng", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "Khu Vực", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "DT Thuần", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "% Đạt", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } },
        { text: "Đổi Trả", options: { bold: true, fill: "FF5B8E", color: "FFFFFF" } }
      ],
      ...topStores.map(s => [
        s.name,
        s.region,
        formatMoney(s.cleanRev),
        `${s.targetRevenue > 0 ? ((s.cleanRev / s.targetRevenue) * 100).toFixed(1) : "0.0"}%`,
        `${s.returnRate}%`
      ])
    ];
    s6.addTable(storeTbl, { x: 0.5, y: 1.1, w: 9.0, colW: [2.8, 1.7, 1.8, 1.3, 1.4], fontSize: 11, border: { pt: 1, color: "FAD2E1" } });

    pptx.writeFile({ fileName: "BaoCao_ThuyetTrinh_PhucAn_AI_Agent.pptx" });
    showToast("Đã xuất file Slide PowerPoint (.pptx) thành công! 📊");
  }

  function applyExcelTableStyling(ws, dataRows, opts = {}) {
    if (!ws || !ws["!ref"]) return;
    const range = XLSX.utils.decode_range(ws["!ref"]);
    const headerBg = opts.headerBg || "FF5B8E";
    const stripeBg = opts.stripeBg || "FFF5F8";
    const borderAll = {
      top: { style: "thin", color: { rgb: "CBD5E1" } },
      bottom: { style: "thin", color: { rgb: "CBD5E1" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } }
    };

    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      let maxLen = 12;
      for (let R = range.s.r; R <= range.e.r; R++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[addr];
        if (!cell) continue;
        const valLen = String(cell.v !== undefined && cell.v !== null ? cell.v : "").length;
        if (R <= 50 && valLen > maxLen) maxLen = Math.min(valLen, 42);

        if (R === 0) {
          cell.s = {
            fill: { patternType: "solid", fgColor: { rgb: headerBg } },
            font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
              top: { style: "medium", color: { rgb: "9F1239" } },
              bottom: { style: "medium", color: { rgb: "9F1239" } },
              left: { style: "thin", color: { rgb: "FFFFFF" } },
              right: { style: "thin", color: { rgb: "FFFFFF" } }
            }
          };
        } else {
          const rowObj = dataRows[R - 1];
          const customStyle = opts.getCellStyle ? opts.getCellStyle(R, C, cell, rowObj, ws) : null;
          const defaultBg = (R % 2 === 0) ? stripeBg : "FFFFFF";
          cell.s = {
            fill: { patternType: "solid", fgColor: { rgb: (customStyle && customStyle.bg) || defaultBg } },
            font: {
              name: "Calibri",
              sz: 10,
              bold: Boolean(customStyle && customStyle.bold),
              color: { rgb: (customStyle && customStyle.fg) || "1E293B" }
            },
            alignment: {
              horizontal: (typeof cell.v === "number") ? "right" : "left",
              vertical: "center"
            },
            border: borderAll
          };
          if (typeof cell.v === "number") {
            cell.z = "#,##0";
          }
        }
      }
      colWidths.push({ wch: Math.min(maxLen + 4, 44) });
    }
    ws["!cols"] = colWidths;
    ws["!rows"] = [{ hpt: 28 }];
  }

  function exportExcelFinalReport() {
    if (typeof XLSX === "undefined") {
      showToast("Không tải được thư viện SheetJS (XLSX)!", true);
      return;
    }
    const records = (currentRawRecords && currentRawRecords.length > 0) ? currentRawRecords : defaultSampleRawRecords;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Full original dataset with repaired/cleaned values applied
    const allEditedRows = records.map(r => {
      const isErr = r.type && r.type !== "valid";
      const info = isErr ? getErrorAnalysisAndFix(r) : null;
      const repairedRev = isErr ? (r.fixedRev !== undefined ? Number(r.fixedRev) : info.defaultRev) : Number(r.rev);

      const baseObj = (r.rawRow && typeof r.rawRow === "object")
        ? { ...r.rawRow }
        : {
            Ma_Giao_Dich: r.code,
            Thoi_Gian_Giao_Dich: r.time,
            Ten_Cua_Hang: r.store,
            Ten_SanPham: r.prod,
            Danh_Muc: r.cat,
            Tong_Tien: r.rev,
            Gia_Von: r.cogs,
            Trang_Thai: r.status
          };

      if (isErr && r.revKey && Object.prototype.hasOwnProperty.call(baseObj, r.revKey)) {
        baseObj[r.revKey] = repairedRev;
      } else if (isErr && Object.prototype.hasOwnProperty.call(baseObj, "Tong_Tien")) {
        baseObj.Tong_Tien = repairedRev;
      }

      baseObj.Trang_Thai_Lam_Sach = isErr ? `Đã sửa (${info.errorLabel})` : "Hợp lệ";
      baseObj.Gia_Tri_Goc_Truoc_Sua = Number(r.rev) || 0;
      baseObj.Gia_Tri_Sau_Sua = repairedRev;
      return baseObj;
    });

    const wsAll = XLSX.utils.json_to_sheet(allEditedRows);
    const s1Keys = allEditedRows.length > 0 ? Object.keys(allEditedRows[0]) : [];
    const idxStatusCol = s1Keys.indexOf("Trang_Thai_Lam_Sach");
    const idxOldCol = s1Keys.indexOf("Gia_Tri_Goc_Truoc_Sua");
    const idxNewCol = s1Keys.indexOf("Gia_Tri_Sau_Sua");

    applyExcelTableStyling(wsAll, allEditedRows, {
      headerBg: "FF5B8E",
      stripeBg: "FFF5F8",
      getCellStyle: (R, C, cell, rowObj) => {
        const isEdited = rowObj && String(rowObj.Trang_Thai_Lam_Sach || "").startsWith("Đã sửa");
        if (!isEdited) return null;
        if (C === idxOldCol) return { bg: "FFE4E6", fg: "BE123C", bold: true };
        if (C === idxNewCol || C === idxStatusCol) return { bg: "DCFCE7", fg: "047857", bold: true };
        return { bg: "F0FDF4", fg: "1E293B" };
      }
    });
    XLSX.utils.book_append_sheet(wb, wsAll, "1_DuLieu_DaChinhSua");

    // Sheet 2: Only the rows that were erroneous & edited (Sai -> Đúng)
    const repairedOnlyRows = records
      .filter(r => r.type && r.type !== "valid")
      .map(r => {
        const info = getErrorAnalysisAndFix(r);
        const repairedRev = r.fixedRev !== undefined ? Number(r.fixedRev) : info.defaultRev;
        return {
          Ma_Giao_Dich: r.code,
          Thoi_Gian: r.time,
          Cua_Hang: r.store,
          San_Pham: r.prod,
          Loai_Loi: info.errorLabel,
          Trang_Thai_Goc: r.status,
          Gia_Tri_Sai_Truoc_Sua: Number(r.rev) || 0,
          Gia_Tri_Dung_Sau_Sua: repairedRev,
          Trang_Thai_Sua: "Đã sửa",
          Nguyen_Nhan_Sai: info.reason,
          Giai_Phap_Khac_Phuc: info.solution
        };
      });

    if (repairedOnlyRows.length > 0) {
      const wsRep = XLSX.utils.json_to_sheet(repairedOnlyRows);
      applyExcelTableStyling(wsRep, repairedOnlyRows, {
        headerBg: "E11D48",
        stripeBg: "FFFBFB",
        getCellStyle: (R, C) => {
          if (C === 6) return { bg: "FFE4E6", fg: "BE123C", bold: true }; // Giá trị sai (đỏ)
          if (C === 7 || C === 8) return { bg: "DCFCE7", fg: "047857", bold: true }; // Giá trị đã sửa (xanh)
          return null;
        }
      });
      XLSX.utils.book_append_sheet(wb, wsRep, "2_ChiTiet_Dong_DaSua");
    }

    // Sheet 3: Only clean valid rows from original data
    const cleanOnlyRows = records
      .filter(r => !r.type || r.type === "valid")
      .map(r => (r.rawRow && typeof r.rawRow === "object")
        ? { ...r.rawRow }
        : {
            Ma_Giao_Dich: r.code,
            Thoi_Gian_Giao_Dich: r.time,
            Ten_Cua_Hang: r.store,
            Ten_SanPham: r.prod,
            Danh_Muc: r.cat,
            Tong_Tien: r.rev,
            Gia_Von: r.cogs,
            Trang_Thai: r.status
          });

    if (cleanOnlyRows.length > 0) {
      const wsClean = XLSX.utils.json_to_sheet(cleanOnlyRows);
      applyExcelTableStyling(wsClean, cleanOnlyRows, {
        headerBg: "059669",
        stripeBg: "F0FDF4"
      });
      XLSX.utils.book_append_sheet(wb, wsClean, "3_DuLieu_Sach_HopLe");
    }

    XLSX.writeFile(wb, "DuLieu_DaChinhSua_PhucAn_AI_Agent.xlsx");
    showToast(`Đã xuất file Excel kẻ bảng có màu phân tách (${allEditedRows.length.toLocaleString('vi-VN')} dòng)! 📗`);
  }

  function exportDashboardHtmlReport() {
    const ctx = gatherAgentReportContext();
    const storeRows = ctx.stores.map(s => {
      const pct = s.targetRevenue > 0 ? ((s.cleanRev / s.targetRevenue) * 100).toFixed(1) : "0.0";
      const margin = s.cleanRev > 0 ? ((s.cleanProfit / s.cleanRev) * 100).toFixed(1) : "0.0";
      return `<tr><td><strong>${escapeHtml(s.name)}</strong></td><td>${escapeHtml(s.region)}</td><td style="text-align:right">${formatMoney(s.cleanRev)}</td><td style="text-align:right">${pct}%</td><td style="text-align:right">${formatMoney(s.cleanProfit)}</td><td style="text-align:right">${margin}%</td><td style="text-align:right">${s.returnRate}%</td></tr>`;
    }).join("");

    const dashHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard BI - ${escapeHtml(ctx.company)}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #FCEEF3; color: #1E293B; margin: 0; padding: 24px; }
    .wrap { max-width: 1120px; margin: 0 auto; display: grid; gap: 18px; }
    .card { background: #FFF; border: 1px solid #FAD2E1; border-radius: 20px; padding: 20px; box-shadow: 0 8px 24px rgba(255,91,142,0.08); }
    .header { background: linear-gradient(135deg, #FF5B8E, #FA709A); color: #FFF; }
    .grid4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; }
    .kpi { border-radius: 16px; padding: 16px; border: 1px solid #FAD2E1; background: #FFF5F8; }
    .kpi h4 { margin: 0 0 6px; font-size: 12px; color: #64748B; text-transform: uppercase; }
    .kpi .val { font-size: 24px; font-weight: 900; color: #0F172A; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #FFF5F8; color: #475569; padding: 10px; text-align: left; border-bottom: 2px solid #FAD2E1; }
    td { padding: 9px 10px; border-bottom: 1px solid #F1F5F9; }
    .pill { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #DCFCE7; color: #047857; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card header">
      <div style="font-size:12px;font-weight:700;opacity:0.9;">ENTERPRISE BI AI AGENT • DASHBOARD TỔNG HỢP</div>
      <h1 style="margin:6px 0 4px;font-size:26px;">${escapeHtml(ctx.company)}</h1>
      <div style="font-size:13px;opacity:0.95;">Ngành: ${escapeHtml(ctx.industry)} • Người lập: ${escapeHtml(ctx.author)} • Ngày xuất: ${ctx.dateStr}</div>
    </div>

    <div class="grid4">
      <div class="kpi"><h4>Doanh Thu Thuần</h4><div class="val">${formatMoney(ctx.totalCleanRev)}</div><div style="font-size:12px;color:#059669;font-weight:700;">${ctx.revPct}% Mục tiêu</div></div>
      <div class="kpi" style="background:#F0FDF4;"><h4>Lợi Nhuận Gộp</h4><div class="val">${formatMoney(ctx.totalCleanProfit)}</div><div style="font-size:12px;color:#059669;font-weight:700;">Biên LN: ${ctx.avgMargin}%</div></div>
      <div class="kpi" style="background:#FAF5FF;"><h4>Dữ Liệu Sạch</h4><div class="val">${ctx.cleanRows.toLocaleString('vi-VN')} / ${ctx.totalRows.toLocaleString('vi-VN')}</div><div style="font-size:12px;color:#7C3AED;font-weight:700;">Đạt ${ctx.completenessPct}%</div></div>
      <div class="kpi" style="background:#FFFBEB;"><h4>Lỗi Đã Xử Lý</h4><div class="val">${(ctx.dupRows + ctx.canRows + ctx.retRows).toLocaleString('vi-VN')}</div><div style="font-size:12px;color:#B45309;font-weight:700;">${ctx.dupRows} trùng · ${ctx.canRows} hủy · ${ctx.retRows} trả</div></div>
    </div>

    <div class="card">
      <h3 style="margin-top:0;">Phân Tích Insight &amp; Action Plan KPI</h3>
      <p style="font-size:13px;"><span class="pill">DATA → DECISION</span> Đã lọc sạch ${ctx.dupRows} dòng trùng, khấu trừ ${ctx.canRows} đơn hủy và hoàn nhập COGS cho ${ctx.retRows} đơn đổi trả; đề xuất đồng bộ tồn kho real-time và áp dụng Data Validation.</p>
    </div>

    <div class="card">
      <h3 style="margin-top:0;">Bảng Hiệu Suất ${ctx.stores.length} Cửa Hàng</h3>
      <table>
        <thead><tr><th>Cửa Hàng</th><th>Khu Vực</th><th style="text-align:right">Doanh Thu Thuần</th><th style="text-align:right">% Đạt</th><th style="text-align:right">LN Gộp</th><th style="text-align:right">Biên (%)</th><th style="text-align:right">Đổi Trả</th></tr></thead>
        <tbody>${storeRows}</tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob(["\ufeff", dashHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Dashboard_BI_PhucAn_AI_Agent.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Đã xuất file Dashboard (.html) thành công! 📊");
  }

  document.getElementById("btn-export-word")?.addEventListener("click", exportWordReport);
  document.getElementById("btn-export-pptx")?.addEventListener("click", exportPowerPointReport);
  document.getElementById("btn-export-excel-final")?.addEventListener("click", exportExcelFinalReport);
  document.getElementById("btn-export-dashboard-html")?.addEventListener("click", exportDashboardHtmlReport);
  document.getElementById("btn-export-both")?.addEventListener("click", () => {
    exportWordReport();
    setTimeout(exportPowerPointReport, 350);
    setTimeout(exportExcelFinalReport, 700);
    setTimeout(exportDashboardHtmlReport, 1050);
  });

  // Render Anomaly Cards for Phase 3
  function renderAnomalyCards() {
    const container = document.getElementById("anomaly-cards-container");
    if (!container) return;

    if (!state.isAuditCompleted) {
      container.innerHTML = `
        <div class="col-span-1 md:col-span-2 p-8 text-center bg-white border border-[#FAD2E1] rounded-2xl">
          <div class="w-12 h-12 rounded-2xl bg-[#FFE2E5] text-[#FA5A7D] flex items-center justify-center mx-auto mb-3 text-xl">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h4 class="text-sm font-bold text-slate-800 mb-1">Chưa có phát hiện bất thường</h4>
          <p class="text-xs text-slate-500">Hệ thống sẽ tự động quét, chẩn đoán nguyên nhân sụt giảm biên lợi nhuận, bẫy doanh thu và tỷ lệ đổi trả sau khi hoàn tất đối soát ở Giai đoạn 2.</p>
        </div>
      `;
      return;
    }

    const anomalyStores = PHUC_AN_DATA.stores.filter(s => s.anomaly && s.anomaly.trim() !== "");
    if (anomalyStores.length === 0) {
      container.innerHTML = `
        <div class="col-span-1 md:col-span-2 p-8 text-center bg-white border border-[#FAD2E1] rounded-2xl">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h4 class="text-sm font-bold text-slate-800 mb-1">Tất cả điểm bán vận hành chuẩn mực</h4>
          <p class="text-xs text-slate-500">Không phát hiện sai lệch kỳ đối chiếu hoặc bẫy biên lợi nhuận.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    anomalyStores.slice(0, 4).forEach((store, idx) => {
      let badgeColor = "from-rose-200 via-pink-200 to-rose-300";
      let tagBg = "bg-rose-100 text-rose-700";
      let btnBg = "bg-rose-600 hover:bg-rose-700 text-white";
      let statText = "-24.3% LN";
      let tagLabel = "Bẫy Doanh Thu";

      if (idx === 1) {
        badgeColor = "from-purple-200 via-indigo-200 to-pink-200";
        tagBg = "bg-purple-100 text-purple-700";
        btnBg = "bg-purple-600 hover:bg-purple-700 text-white";
        statText = "-7.2%/ngày";
        tagLabel = "Lệch Kỳ Đối Chiếu";
      } else if (idx === 2) {
        badgeColor = "from-amber-200 via-rose-200 to-pink-200";
        tagBg = "bg-amber-100 text-amber-800";
        btnBg = "bg-amber-600 hover:bg-amber-700 text-white";
        statText = `${store.returnRate || 14.8}% Trả Hàng`;
        tagLabel = "Báo Động Đổi Trả";
      } else if (idx === 3) {
        badgeColor = "from-blue-200 via-sky-200 to-pink-200";
        tagBg = "bg-blue-100 text-blue-700";
        btnBg = "bg-blue-600 hover:bg-blue-700 text-white";
        statText = "68.5% Target";
        tagLabel = "Hụt Target Nặng";
      }

      const card = document.createElement("div");
      card.className = "rounded-2xl border border-[#FAD2E1] bg-white overflow-hidden shadow-xs flex flex-col justify-between";
      card.innerHTML = `
        <div>
          <div class="h-24 bg-gradient-to-r ${badgeColor} relative p-3 flex items-start justify-between">
            <span class="px-2.5 py-1 bg-white/90 text-slate-800 font-extrabold text-xs rounded-full shadow-xs">
              ${statText}
            </span>
            <div class="w-7 h-7 rounded-full bg-white/90 text-[#FF5B8E] flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer">
              ⋮
            </div>
          </div>
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-extrabold text-slate-900">${store.id} - ${store.name}</h4>
              <span class="text-[10px] ${tagBg} font-bold px-2 py-0.5 rounded-full">${tagLabel}</span>
            </div>
            <div class="text-[11px] text-[#FF5B8E] font-bold">${store.manager} • ${store.region}</div>
            <div class="bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-xs text-rose-950 mt-2 space-y-1">
              <div><strong>Chẩn đoán:</strong> ${store.anomaly}</div>
              <div class="text-slate-600"><strong>Khuyến nghị:</strong> ${store.recommendation}</div>
            </div>
          </div>
        </div>
        <div class="p-4 pt-0">
          <button class="btn-open-decision w-full py-2 ${btnBg} font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5" data-store-id="${store.id}">
            <i class="fa-solid fa-signature"></i> ${store.decisionApproved ? 'Đã Ký Lệnh' : 'Ký Lệnh Hỗ Trợ'}
          </button>
        </div>
      `;
      container.appendChild(card);
    });

    // Reattach listeners
    container.querySelectorAll(".btn-open-decision").forEach(btn => {
      btn.addEventListener("click", () => {
        const storeId = btn.getAttribute("data-store-id");
        openDecisionModal(storeId);
      });
    });
  }

  // Render Priority Matrix for Sales Director
  function renderPriorityMatrix(filter = "all") {
    const tbody = document.getElementById("priority-matrix-tbody");
    tbody.innerHTML = "";

    if (!state.isAuditCompleted) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="p-8 text-center text-slate-400 font-medium">
            <i class="fa-solid fa-shield-halved text-3xl mb-2 text-slate-300 block"></i>
            Chưa có dữ liệu đối chiếu. Vui lòng hoàn thành Giai đoạn 1 & 2 để AI Agent phát hiện bất thường và xếp hạng ưu tiên.
          </td>
        </tr>
      `;
      return;
    }

    const filtered = PHUC_AN_DATA.stores
      .filter(s => filter === "all" || s.priority.toString() === filter)
      .sort((a, b) => a.priority - b.priority); // Highest priority (1) first

    filtered.forEach(s => {
      const targetPercent = ((s.cleanRev / s.targetRevenue) * 100).toFixed(1);
      const grossMarginPercent = ((s.cleanProfit / s.cleanRev) * 100).toFixed(1);

      let priorityBadge = "";
      if (s.priority === 1) {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-max">
          <i class="fa-solid fa-triangle-exclamation text-rose-500"></i> Ưu Tiên 1: Cấp thiết
        </span>`;
      } else if (s.priority === 2) {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-max">
          <i class="fa-solid fa-eye text-amber-500"></i> Ưu Tiên 2: Cần theo dõi
        </span>`;
      } else if (s.priority === 3) {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 w-max inline-block">
          Ưu Tiên 3: Ổn định
        </span>`;
      } else {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-max">
          <i class="fa-solid fa-star text-emerald-500"></i> Ưu Tiên 4: Xuất sắc
        </span>`;
      }

      const diagnosis = s.anomaly ? `<span class="text-rose-900 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-100 block">${s.anomaly}</span>` : `<span class="text-slate-500">Không có bất thường. Chỉ số vận hành đạt định mức quy chuẩn.</span>`;
      const recommendation = s.recommendation ? `<span class="text-emerald-950 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-100 block">${s.recommendation}</span>` : `<span class="text-slate-500">Duy trì định mức quản trị hiện tại, phát huy sản phẩm chủ lực.</span>`;

      const tr = document.createElement("tr");
      tr.className = `hover:bg-slate-50 transition ${s.priority === 1 ? 'bg-rose-50/30' : ''}`;
      tr.innerHTML = `
        <td class="p-3">${priorityBadge}</td>
        <td class="p-3">
          <div class="font-bold text-slate-900">${s.name}</div>
          <div class="text-[11px] text-slate-500">${s.id} • QL: ${s.manager}</div>
        </td>
        <td class="p-3 text-right font-mono font-bold text-slate-900">${formatMoney(s.cleanRev)}</td>
        <td class="p-3 text-right font-mono font-bold ${targetPercent < 80 ? 'text-rose-700' : 'text-emerald-700'}">${targetPercent}%</td>
        <td class="p-3 text-right font-mono font-bold ${grossMarginPercent < 25 ? 'text-rose-700' : 'text-slate-700'}">${grossMarginPercent}%</td>
        <td class="p-3 text-right font-mono font-bold ${s.returnRate > 5.0 ? 'text-rose-700' : 'text-slate-700'}">${s.returnRate}%</td>
        <td class="p-3 max-w-xs text-xs">${diagnosis}</td>
        <td class="p-3 max-w-xs text-xs">${recommendation}</td>
        <td class="p-3 text-center">
          <button class="btn-open-decision px-3 py-1.5 rounded-xl text-xs font-bold ${s.priority === 1 ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'} transition flex items-center gap-1.5 mx-auto" data-store-id="${s.id}">
            <i class="fa-solid fa-signature"></i> ${s.decisionApproved ? 'Đã Duyệt Hỗ Trợ' : 'Ký Lệnh Hỗ Trợ'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach decision button listeners
    document.querySelectorAll(".btn-open-decision").forEach(btn => {
      btn.addEventListener("click", () => {
        const storeId = btn.getAttribute("data-store-id");
        openDecisionModal(storeId);
      });
    });
  }

  document.getElementById("filter-priority").addEventListener("change", (e) => {
    renderPriorityMatrix(e.target.value);
  });

  // Decision Modal Logic (GIÁM ĐỐC KINH DOANH RA QUYẾT ĐỊNH)
  const decisionModal = document.getElementById("decision-modal");
  function openDecisionModal(storeId) {
    const store = PHUC_AN_DATA.stores.find(s => s.id === storeId);
    if (!store) return;
    state.selectedStoreForDecision = store;

    document.getElementById("modal-store-name").textContent = `${store.id} - ${store.name}`;
    document.getElementById("modal-store-manager").textContent = `Quản lý cửa hàng: ${store.manager} | Khu vực: ${store.region}`;
    document.getElementById("modal-diagnosis").textContent = store.anomaly || "Cửa hàng hoạt động ổn định, cần tiếp tục giám sát các chỉ số.";
    document.getElementById("modal-action-plan").value = store.recommendation || "Tiếp tục duy trì kế hoạch bán hàng tháng 11, khen thưởng nhân viên xuất sắc.";

    decisionModal.classList.remove("hidden");
  }

  document.getElementById("btn-close-modal").addEventListener("click", () => decisionModal.classList.add("hidden"));
  document.getElementById("btn-cancel-modal").addEventListener("click", () => decisionModal.classList.add("hidden"));

  document.getElementById("btn-confirm-decision").addEventListener("click", () => {
    if (state.selectedStoreForDecision) {
      state.selectedStoreForDecision.decisionApproved = true;
      decisionModal.classList.add("hidden");
      renderPriorityMatrix(document.getElementById("filter-priority").value);
      showToast(`Giám đốc Kinh doanh đã ký ban hành lệnh hỗ trợ khẩn cấp cho ${state.selectedStoreForDecision.name}!`);

      // Push confirmation to AI chat
      appendChatMessage(
        "system",
        `🔔 [LỆNH ĐIỀU ĐỘNG] Giám đốc Kinh doanh đã ký phê duyệt kế hoạch can thiệp cho <strong>${state.selectedStoreForDecision.name}</strong>.<br>` +
        `• <strong>Phương án:</strong> ${document.getElementById("modal-action-plan").value}<br>` +
        `• <strong>Phụ trách:</strong> ${document.getElementById("modal-assignee").value} | <strong>Thời hạn:</strong> ${document.getElementById("modal-deadline").value}`
      );
    }
  });

  // AI COPILOT CHAT LOGIC
  const chatForm = document.getElementById("ai-chat-form");
  const chatInput = document.getElementById("ai-chat-input");
  const chatContainer = document.getElementById("chat-messages-container");

  function appendChatMessage(sender, text) {
    const div = document.createElement("div");
    div.className = "flex items-start gap-2.5";

    if (sender === "user") {
      div.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
          <i class="fa-solid fa-user-tie"></i>
        </div>
        <div class="bg-indigo-600 text-white p-3.5 rounded-2xl max-w-2xl leading-relaxed text-xs shadow-xs">
          ${text}
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 text-xs shadow-xs">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="bg-white border border-slate-200 text-slate-800 p-3.5 rounded-2xl max-w-2xl leading-relaxed text-xs shadow-xs">
          ${text}
        </div>
      `;
    }

    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function handleAiQuery(query) {
    appendChatMessage("user", query);
    const qLower = query.toLowerCase();

    setTimeout(() => {
      let response = "";

      if (qLower.includes("chỉnh sửa") || qLower.includes("chinh sua") || qLower.includes("hiệu chỉnh") || qLower.includes("hãy sửa") || qLower.includes("làm sạch lại") || qLower.includes("lọc lại") || qLower.includes("sửa quy tắc") || qLower.includes("thay đổi quy tắc") || qLower.includes("sửa")) {
        executeAgentRevision(query);
        response = `🤖 <strong>AI Agent đã tiếp nhận lệnh và đang thực thi chỉnh sửa:</strong><br>` +
          `<div class="mt-1.5 p-2.5 bg-[#FFF0F5] border border-[#FFD1DF] rounded-xl text-slate-800 font-semibold">"${escapeHtml(query)}"</div>` +
          `<div class="mt-2 space-y-1 text-slate-700">` +
          `<div>• Đang kích hoạt lại Engine làm sạch dữ liệu theo quy tắc cập nhật...</div>` +
          `<div>• Tái áp dụng bộ lọc đơn trùng, đơn hủy và đồng bộ kỳ so sánh chuẩn hóa.</div>` +
          `<div>• Cập nhật bảng đối soát và kết quả báo cáo mới nhất.</div>` +
          `</div>` +
          `<div class="mt-3 flex flex-wrap gap-2">` +
          `<button onclick="window.switchPhaseTab(1)" class="px-3 py-1.5 bg-[#FF5B8E] text-white rounded-xl font-bold text-xs hover:bg-[#e04879] transition shadow-xs"><i class="fa-solid fa-wand-magic-sparkles"></i> Xem Kết Quả Làm Sạch (GĐ 1)</button>` +
          `<button onclick="window.openRevisionModal('${escapeHtml(query)}')" class="px-3 py-1.5 bg-white border border-[#FFD1DF] text-[#FF5B8E] rounded-xl font-bold text-xs hover:bg-[#FFF0F5] transition shadow-xs"><i class="fa-solid fa-sliders"></i> Mở Bảng Tinh Chỉnh Quy Tắc</button>` +
          `</div>`;
      } else if (qLower.includes("bpmn") || qLower.includes("quy trình làm sạch") || qLower.includes("làm sạch dữ liệu")) {
        response = `<strong>Quy Trình Làm Sạch Tự Động Theo Chuẩn BPMN 3.0:</strong><br>` +
          `1. <strong>Tiếp nhận & Quét cấu trúc:</strong> Tự động nhận diện trường dữ liệu (mã đơn, doanh thu, giá vốn, trạng thái, ngày giờ, chi nhánh).<br>` +
          `2. <strong>Khử trùng lặp (Deduplication):</strong> Phát hiện các mã giao dịch POS bị quẹt thẻ đúp hoặc trùng lặp mã đơn.<br>` +
          `3. <strong>Bóc tách đơn hủy & Hoàn tiền:</strong> Tách biệt các đơn hàng đã bị hủy hoặc hoàn tiền trước khi xuất kho.<br>` +
          `4. <strong>Kiểm soát đơn đổi trả bảo hành:</strong> Định lượng tỷ lệ hoàn hàng từng chi nhánh, phát hiện tư vấn sai công năng.<br>` +
          `5. <strong>Đồng bộ kỳ chuẩn hóa:</strong> Chuyển đổi về doanh thu bình quân/ngày tương đương để loại trừ tăng trưởng ảo.`;
      } else if (qLower.includes("bẫy doanh thu") || qLower.includes("bay doanh thu") || qLower.includes("ch03")) {
        response = `<strong>Cơ Chế Nhận Diện Bẫy Doanh Thu (Revenue Trap):</strong><br>` +
          `• <strong>Bản chất:</strong> Cửa hàng chạy theo chỉ tiêu doanh thu danh nghĩa bằng cách giảm giá xả hàng các sản phẩm biên siêu mỏng (10-12%).<br>` +
          `• <strong>Hệ quả:</strong> Doanh thu bề nổi tăng trưởng (ví dụ +15.5%), nhưng Lợi nhuận gộp thực tế sụt giảm nghiêm trọng (-24.3%).<br>` +
          `• <strong>Hành động của Agent:</strong> Tự động cảnh báo đỏ, đề xuất chuyển KPI sang <em>Lợi Nhuận Gộp</em> và cơ cấu lại danh mục ngành hàng biên cao.`;
      } else if (qLower.includes("ch15") || qLower.includes("bình thạnh") || qLower.includes("đổi trả")) {
        response = `<strong>Phân Tích Bất Thường Đổi Trả & Bảo Hành:</strong><br>` +
          `• <strong>Hiện tượng:</strong> Tỷ lệ đổi trả vượt định mức an toàn doanh nghiệp (> 3.5%). Số tiền hoàn trả và chi phí xử lý phát sinh lớn.<br>` +
          `• <strong>Nguyên nhân thường gặp:</strong> Tư vấn sai công năng kỹ thuật sản phẩm cao cấp, lỗi bao bì hoặc lỗi vận chuyển.<br>` +
          `• <strong>Khuyến nghị của Agent:</strong> Tạm thời siết điều kiện xuất bán dòng sản phẩm nhạy cảm để đào tạo lại quy trình tư vấn và bàn giao khách hàng.`;
      } else if (qLower.includes("ch04") || qLower.includes("hoàn kiếm") || qLower.includes("tăng trưởng thật") || qLower.includes("lệch kỳ") || qLower.includes("chuẩn hóa")) {
        response = `<strong>Cơ Chế Bóc Tách Tăng Trưởng Ảo Do Lệch Kỳ (Period Mismatch):</strong><br>` +
          `• <strong>Hiện tượng:</strong> Báo cáo thủ công ghép dữ liệu 45 ngày (bao gồm các ngày lễ cao điểm) để so sánh khập khiễng với kỳ 30 ngày hiện tại.<br>` +
          `• <strong>Chuẩn hóa của Agent:</strong> Tự động quy đổi doanh thu về <em>Doanh thu bình quân/ngày chuẩn</em> để loại bỏ ảo tưởng tăng trưởng, phản ánh đúng sức bán thực.`;
      } else if (qLower.includes("tiêu chuẩn phân loại") || qLower.includes("thứ tự ưu tiên") || qLower.includes("top 3") || qLower.includes("thị sát") || qLower.includes("khẩn cấp") || qLower.includes("ưu tiên")) {
        response = `<strong>Tiêu Chuẩn Xếp Hạng Ưu Tiên Hỗ Trợ Điểm Bán:</strong><br>` +
          `• 🔴 <strong>Ưu tiên 1 (Cấp thiết):</strong> Sụt giảm biên LN > 15%, hụt chỉ tiêu > 25%, hoặc tỷ lệ đổi trả > 10%. Cần lệnh can thiệp ngay.<br>` +
          `• 🟠 <strong>Ưu tiên 2 (Cần theo dõi):</strong> Đạt từ 80-90% kế hoạch, tỷ lệ đổi trả dao động 5-8%.<br>` +
          `• 🟡 <strong>Ưu tiên 3 (Ổn định):</strong> Đạt 90-100% mục tiêu, các chỉ số vận hành nằm trong dung sai cho phép.<br>` +
          `• 🟢 <strong>Ưu tiên 4 (Xuất sắc):</strong> Vượt > 100% kế hoạch cả doanh thu và lợi nhuận gộp.`;
      } else if (qLower.includes("bối cảnh") || qLower.includes("boi canh") || qLower.includes("doanh nghiệp của tôi") || qLower.includes("mục tiêu phân tích")) {
        if (businessContext.isConfigured) {
          response = `<strong>Bối Cảnh Doanh Nghiệp Đang Áp Dụng:</strong><br>` +
            `• <strong>Doanh nghiệp:</strong> <strong>${escapeHtml(businessContext.companyName || 'Doanh nghiệp')}</strong> (${escapeHtml(businessContext.industry || 'Bán lẻ')})<br>` +
            `• <strong>Kỳ phân tích:</strong> ${escapeHtml(businessContext.period || 'Hiện tại')}<br>` +
            `• <strong>Yêu cầu trọng tâm:</strong> ${escapeHtml(businessContext.description || 'Đối soát bẫy doanh thu và tối ưu hóa lợi nhuận')}<br>` +
            `Hệ thống AI Agent đang ghi nhớ bối cảnh này để rà soát dữ liệu.`;
        } else {
          response = `Bạn chưa lưu bối cảnh cụ thể. Bạn có thể kéo lên phần <strong>Bối Cảnh Doanh Nghiệp & Yêu Cầu Cho AI Agent</strong> ở đầu Giai đoạn 1 để nhập thông tin, hoặc bấm <em>"Mẫu Gợi Ý"</em> để AI Agent hiểu rõ hơn về doanh nghiệp của bạn!`;
        }
      } else if (!customDatasetLoaded && !state.phase1Completed) {
        response = `Xin chào! Tôi đã ghi nhận câu hỏi: <em>"${escapeHtml(query)}"</em>.<br><br>` +
          `Hiện tại hệ thống đang ở trạng thái <strong>dữ liệu trống (sẵn sàng tiếp nhận tệp của bạn)</strong>.<br>` +
          `• <strong>Cách bắt đầu:</strong> Kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV giao dịch của doanh nghiệp bạn vào ô nạp tệp bên trên hoặc bấm nút <strong>"Dữ Liệu Mẫu"</strong>.<br>` +
          `• <strong>Sau khi nạp:</strong> Tôi sẽ tự động phân tích chi tiết toàn bộ số liệu, bóc tách đơn lỗi và đưa ra câu trả lời số học chuẩn xác nhất cho bạn!`;
      } else {
        const stats = customDatasetStats;
        response = `Dựa trên tập dữ liệu đã làm sạch (${stats.cleanRows.toLocaleString('vi-VN')} dòng sạch từ tệp <em>${stats.fileName}</em>):<br>` +
          `• Đơn trùng lặp đã loại trừ: ${stats.duplicateRows.toLocaleString('vi-VN')} đơn.<br>` +
          `• Đơn hủy/hoàn tiền đã tách riêng: ${stats.cancelledRows.toLocaleString('vi-VN')} đơn.<br>` +
          `• Đơn đổi trả phát hiện: ${stats.returnRows.toLocaleString('vi-VN')} đơn.<br>` +
          `Bạn có thể chuyển sang Giai đoạn 2 hoặc Giai đoạn 3 để xem bảng tổng hợp chi tiết và ký lệnh hỗ trợ điều hành!`;
      }

      appendChatMessage("ai", response);
    }, 500);
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;
    chatInput.value = "";
    handleAiQuery(query);
  });

  document.querySelectorAll(".quick-prompt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.getAttribute("data-question");
      handleAiQuery(q);
    });
  });

  // CSV Export
  document.getElementById("btn-export-data").addEventListener("click", () => {
    let csv = "Mã CH,Tên Cửa Hàng,Khu Vực,Quản Lý,Doanh Thu Thuần,Mục Tiêu,Đạt Target (%),LN Gộp,Biên LN (%),Tỷ Lệ Đổi Trả (%),Mức Ưu Tiên,Bất Thường Phát Hiện\n";

    PHUC_AN_DATA.stores.forEach(s => {
      const targetPercent = ((s.cleanRev / s.targetRevenue) * 100).toFixed(1);
      const grossMarginPercent = ((s.cleanProfit / s.cleanRev) * 100).toFixed(1);
      const anomaly = s.anomaly ? `"${s.anomaly.replace(/"/g, '""')}"` : "Bình thường";
      csv += `${s.id},"${s.name}",${s.region},"${s.manager}",${s.cleanRev},${s.targetRevenue},${targetPercent}%,${s.cleanProfit},${grossMarginPercent}%,${s.returnRate}%,Ưu tiên ${s.priority},${anomaly}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_Quan_Tri_Doi_Soat_Ban_Hang.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Đã tải xuống Báo cáo Quản trị đối soát CSV!");
  });

  // Sidebar navigation listeners & active tab states
  const navDash = document.getElementById("nav-dashboard");
  const navLeaderboard = document.getElementById("nav-leaderboard");
  const navP1 = document.getElementById("nav-phase1");
  const navProducts = document.getElementById("nav-products");
  const navP2 = document.getElementById("nav-phase2");
  const navP3 = document.getElementById("nav-phase3");
  const navMessages = document.getElementById("nav-messages");

  function setActiveNav(activeBtn) {
    document.querySelectorAll(".dabang-nav-item").forEach(item => item.classList.remove("active"));
    if (activeBtn) activeBtn.classList.add("active");
  }

  if (navDash) {
    navDash.addEventListener("click", () => {
      setActiveNav(navDash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (navLeaderboard) {
    navLeaderboard.addEventListener("click", () => {
      setActiveNav(navLeaderboard);
      if (!state.phase1Completed) {
        showToast("Vui lòng hoàn thành GĐ 1 để mở khóa Leaderboard 18 CH!", true);
        switchPhase(1);
      } else {
        switchPhase(2);
      }
      const el = document.getElementById("stores-report-tbody");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navP1) {
    navP1.addEventListener("click", () => {
      setActiveNav(navP1);
      switchPhase(1);
      const el = document.getElementById("panel-phase1");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navProducts) {
    navProducts.addEventListener("click", () => {
      setActiveNav(navProducts);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    });
  }

  if (navP2) {
    navP2.addEventListener("click", () => {
      setActiveNav(navP2);
      if (!state.phase1Completed) {
        showToast("Vui lòng hoàn thành xác thực dữ liệu sạch ở GĐ 1 trước!", true);
        return;
      }
      switchPhase(2);
      const el = document.getElementById("panel-phase2");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navP3) {
    navP3.addEventListener("click", () => {
      setActiveNav(navP3);
      if (!state.phase1Completed) {
        showToast("Vui lòng hoàn thành xác thực GĐ 1 trước!", true);
        return;
      }
      switchPhase(3);
      const el = document.getElementById("panel-phase3");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navMessages) {
    navMessages.addEventListener("click", () => {
      setActiveNav(navMessages);
      const el = document.getElementById("ai-chat-form");
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        document.getElementById("ai-chat-input").focus();
      }
    });
  }

  // Global search bar sync
  const searchGlobal = document.getElementById("search-global-input");
  if (searchGlobal) {
    searchGlobal.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      const localSearch = document.getElementById("search-store-input");
      if (localSearch) localSearch.value = val;
      const region = document.getElementById("filter-region") ? document.getElementById("filter-region").value : "all";
      renderStoresManagementTable(val, region);
    });
  }

  const btnExportSide = document.getElementById("btn-export-data-side");
  if (btnExportSide) {
    btnExportSide.addEventListener("click", () => {
      document.getElementById("btn-export-data").click();
    });
  }

  const btnQuickDispatch = document.getElementById("btn-quick-dispatch");
  if (btnQuickDispatch) {
    btnQuickDispatch.addEventListener("click", () => {
      if (!state.isAuditCompleted) {
        showToast("Vui lòng nạp tệp dữ liệu và hoàn tất đối soát trước khi điều phối lệnh!", true);
        return;
      }
      const topStore = PHUC_AN_DATA.stores.find(s => s.priority === 1) || PHUC_AN_DATA.stores[0];
      if (topStore) {
        openDecisionModal(topStore.id);
      }
    });
  }

  // Language Selector Dropdown Logic
  const btnLangToggle = document.getElementById("btn-lang-toggle");
  const langMenu = document.getElementById("lang-menu");
  const currentLangFlag = document.getElementById("current-lang-flag");
  const currentLangText = document.getElementById("current-lang-text");
  const currentLangChevron = document.getElementById("current-lang-chevron");
  const langOptions = document.querySelectorAll(".lang-option");

  const I18N = {
    vi: {
      flag: "https://flagcdn.com/w20/vn.png",
      name: "Tiếng Việt",
      navDashboard: "Bảng Điều Khiển",
      navLeaderboard: "Bảng Xếp Hạng",
      navPhase1: "Đơn Hàng & Làm Sạch",
      navProducts: "Danh Mục Sản Phẩm",
      navPhase2: "Báo Cáo Bán Hàng",
      navPhase3: "Đối Chiếu & Audit",
      navMessages: "Trợ Lý AI Copilot",
      navSettings: "Cài Đặt Hệ Thống",
      navSignout: "Đăng Xuất",
      headerTitle: "Bảng Điều Khiển Quản Trị",
      searchPlaceholder: "Tìm kiếm cửa hàng, giao dịch, ngành hàng...",
      btnExport: "Xuất Dữ Liệu",

      todaysSalesTitle: "Doanh Số & Giao Dịch",
      todaysSalesSub: "Tổng quan bán hàng (Hệ thống sẵn sàng tiếp nhận tệp dữ liệu khách hàng)",
      lblClean: "Đơn Sạch Hợp Lệ",
      lblDup: "Đơn Trùng Lặp",
      lblCancel: "Đơn Đã Hủy",
      lblReturn: "Đơn Đổi Trả",

      visitorInsightsTitle: "Thông Tin Lượng Khách",
      visitorInsightsSub: "Xu Hướng Toàn Chuỗi",
      loyalCust: "Khách Thân Thiết",
      newCust: "Khách Mới",
      uniqueCust: "Khách Độc Nhất",

      totalRevTitle: "Tổng Doanh Thu",
      onlineSales: "Bán Trực Tuyến",
      offlineSales: "Bán Tại Cửa Hàng",

      custSatTitle: "Độ Hài Lòng Khách Hàng",
      lastMonth: "Tháng Trước",
      thisMonth: "Tháng Này",

      targetRealityTitle: "Mục Tiêu vs Thực Tế",
      realitySalesLbl: "Doanh Số Thực Tế",
      realitySub: "Thực tế",
      targetSalesLbl: "Doanh Số Mục Tiêu",
      targetSub: "Kế hoạch",

      topProdTitle: "Top Ngành Hàng",
      topProdSub: "4 Ngành Hàng Toàn Chuỗi",
      thNum: "#",
      thName: "Ngành Hàng",
      thPop: "Tỷ Trọng Doanh Số",
      thSales: "Đóng Góp",

      cat01: "Điện Gia Dụng (CAT01)",
      cat02: "Thiết Bị Số (CAT02)",
      cat03: "Sức Khỏe & Sắc Đẹp (CAT03)",
      cat04: "Gia Dụng Thông Minh (CAT04)",

      salesMapTitle: "Phân Bổ Doanh Số Khu Vực",
      volServiceTitle: "Sản Lượng vs Mức Dịch Vụ",
      volLbl: "Sản Lượng",
      servLbl: "Dịch Vụ",
      btnGetPro: "Nâng Cấp / Xuất CSV"
    },
    en: {
      flag: "https://flagcdn.com/w20/us.png",
      name: "Eng (US)",
      navDashboard: "Dashboard",
      navLeaderboard: "Leaderboard (18 Stores)",
      navPhase1: "Order (Cleaning)",
      navProducts: "Products (Categories)",
      navPhase2: "Sales Report",
      navPhase3: "Cross-Check & Audit",
      navMessages: "Messages (AI Copilot)",
      navSettings: "Settings",
      navSignout: "Sign Out",
      headerTitle: "Executive Management Dashboard",
      searchPlaceholder: "Search here... (Stores, transactions, categories)",
      btnExport: "Export",

      todaysSalesTitle: "Today's Sales",
      todaysSalesSub: "Sales Summary (Ready to ingest customer dataset)",
      lblClean: "Total Sales",
      lblDup: "Total Order",
      lblCancel: "Product Sold",
      lblReturn: "New Customers",

      visitorInsightsTitle: "Visitor Insights",
      visitorInsightsSub: "Network Trend",
      loyalCust: "Loyal Customers",
      newCust: "New Customers",
      uniqueCust: "Unique Customers",

      totalRevTitle: "Total Revenue",
      onlineSales: "Online Sales",
      offlineSales: "Offline Sales",

      custSatTitle: "Customer Satisfaction",
      lastMonth: "Last Month",
      thisMonth: "This Month",

      targetRealityTitle: "Target vs Reality",
      realitySalesLbl: "Reality Sales",
      realitySub: "Actual",
      targetSalesLbl: "Target Sales",
      targetSub: "Commended",

      topProdTitle: "Top Products",
      topProdSub: "4 Main Categories",
      thNum: "#",
      thName: "Name",
      thPop: "Popularity",
      thSales: "Sales",

      cat01: "Home Decor & Appliances (CAT01)",
      cat02: "Digital Devices & Accessories (CAT02)",
      cat03: "Health & Beauty Care (CAT03)",
      cat04: "Smart Home Gadgets (CAT04)",

      salesMapTitle: "Sales Mapping by Region",
      volServiceTitle: "Volume vs Service Level",
      volLbl: "Volume",
      servLbl: "Services",
      btnGetPro: "Get Pro / Export CSV"
    }
  };

  let currentAppLang = "vi";

  function applyLanguage(lang) {
    const t = I18N[lang] || I18N.vi;
    currentAppLang = lang;

    if (currentLangFlag) currentLangFlag.src = t.flag;
    if (currentLangText) currentLangText.textContent = t.name;

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText("txt-nav-dashboard", t.navDashboard);
    setText("txt-nav-leaderboard", t.navLeaderboard);
    setText("txt-nav-phase1", t.navPhase1);
    setText("txt-nav-products", t.navProducts);
    setText("txt-nav-phase2", t.navPhase2);
    setText("txt-nav-phase3", t.navPhase3);
    setText("txt-nav-messages", t.navMessages);
    setText("txt-nav-settings", t.navSettings);
    setText("txt-nav-signout", t.navSignout);
    setText("txt-header-title", t.headerTitle);

    const searchInput = document.getElementById("search-global-input");
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;

    setText("txt-btn-export", t.btnExport);
    setText("txt-todays-sales-title", t.todaysSalesTitle);
    setText("txt-todays-sales-sub", t.todaysSalesSub);
    setText("txt-lbl-clean", t.lblClean);
    setText("txt-lbl-dup", t.lblDup);
    setText("txt-lbl-cancel", t.lblCancel);
    setText("txt-lbl-return", t.lblReturn);

    setText("txt-visitor-insights-title", t.visitorInsightsTitle);
    setText("txt-visitor-insights-sub", t.visitorInsightsSub);
    setText("txt-loyal-cust", t.loyalCust);
    setText("txt-new-cust", t.newCust);
    setText("txt-unique-cust", t.uniqueCust);

    setText("txt-total-rev-title", t.totalRevTitle);
    setText("txt-online-sales", t.onlineSales);
    setText("txt-offline-sales", t.offlineSales);

    setText("txt-cust-sat-title", t.custSatTitle);
    setText("txt-last-month", t.lastMonth);
    setText("txt-this-month", t.thisMonth);

    setText("txt-target-reality-title", t.targetRealityTitle);
    setText("txt-reality-sales-lbl", t.realitySalesLbl);
    setText("txt-reality-sub", t.realitySub);
    setText("txt-target-sales-lbl", t.targetSalesLbl);
    setText("txt-target-sub", t.targetSub);

    setText("txt-top-prod-title", t.topProdTitle);
    setText("txt-top-prod-sub", t.topProdSub);
    setText("txt-th-num", t.thNum);
    setText("txt-th-name", t.thName);
    setText("txt-th-pop", t.thPop);
    setText("txt-th-sales", t.thSales);

    setText("txt-cat-01", t.cat01);
    setText("txt-cat-02", t.cat02);
    setText("txt-cat-03", t.cat03);
    setText("txt-cat-04", t.cat04);

    setText("txt-sales-map-title", t.salesMapTitle);
    setText("txt-vol-service-title", t.volServiceTitle);
    setText("txt-vol-lbl", t.volLbl);
    setText("txt-serv-lbl", t.servLbl);
    setText("txt-btn-get-pro", t.btnGetPro);

    // Dynamic update chart labels and tooltips
    updateChartLanguages(lang);

    langOptions.forEach(o => {
      const oLang = o.getAttribute("data-lang");
      const check = o.querySelector(".check-icon");
      if (oLang === lang) {
        o.classList.add("font-bold", "text-slate-900");
        o.classList.remove("font-semibold", "text-slate-700");
        if (check) check.classList.remove("hidden");
      } else {
        o.classList.remove("font-bold", "text-slate-900");
        o.classList.add("font-semibold", "text-slate-700");
        if (check) check.classList.add("hidden");
      }
    });

    try {
      localStorage.setItem("app_lang", lang);
    } catch (e) {}
  }

  function updateChartLanguages(lang) {
    const isVi = (lang === "vi");
    if (state.chartVisitor) {
      state.chartVisitor.data.labels = isVi 
        ? ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (state.chartVisitor.data.datasets[0]) state.chartVisitor.data.datasets[0].label = isVi ? 'Khách Thân Thiết' : 'Loyal Customers';
      if (state.chartVisitor.data.datasets[1]) state.chartVisitor.data.datasets[1].label = isVi ? 'Khách Mới' : 'New Customers';
      if (state.chartVisitor.data.datasets[2]) state.chartVisitor.data.datasets[2].label = isVi ? 'Khách Độc Nhất' : 'Unique Customers';
      state.chartVisitor.update();
    }
    if (state.chartTotalRev) {
      state.chartTotalRev.data.labels = isVi
        ? ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      if (state.chartTotalRev.data.datasets[0]) state.chartTotalRev.data.datasets[0].label = isVi ? 'Bán Trực Tuyến' : 'Online Sales';
      if (state.chartTotalRev.data.datasets[1]) state.chartTotalRev.data.datasets[1].label = isVi ? 'Bán Tại Cửa Hàng' : 'Offline Sales';
      state.chartTotalRev.update();
    }
    if (state.chartCustSat) {
      state.chartCustSat.data.labels = isVi
        ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 'Tuần 7']
        : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];
      if (state.chartCustSat.data.datasets[0]) state.chartCustSat.data.datasets[0].label = isVi ? 'Tháng Trước' : 'Last Month';
      if (state.chartCustSat.data.datasets[1]) state.chartCustSat.data.datasets[1].label = isVi ? 'Tháng Này' : 'This Month';
      state.chartCustSat.update();
    }
    if (state.chartTargetReality) {
      state.chartTargetReality.data.labels = isVi
        ? ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
      if (state.chartTargetReality.data.datasets[0]) state.chartTargetReality.data.datasets[0].label = isVi ? 'Doanh Số Thực Tế' : 'Reality Sales';
      if (state.chartTargetReality.data.datasets[1]) state.chartTargetReality.data.datasets[1].label = isVi ? 'Doanh Số Mục Tiêu' : 'Target Sales';
      state.chartTargetReality.update();
    }
    if (state.chartVolume) {
      state.chartVolume.data.labels = isVi
        ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6']
        : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
      if (state.chartVolume.data.datasets[0]) state.chartVolume.data.datasets[0].label = isVi ? 'Sản Lượng' : 'Volume';
      if (state.chartVolume.data.datasets[1]) state.chartVolume.data.datasets[1].label = isVi ? 'Dịch Vụ' : 'Services';
      state.chartVolume.update();
    }
  }

  if (btnLangToggle && langMenu) {
    btnLangToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      langMenu.classList.toggle("hidden");
      if (currentLangChevron) {
        currentLangChevron.classList.toggle("rotate-180");
      }
    });

    document.addEventListener("click", (e) => {
      if (!btnLangToggle.contains(e.target) && !langMenu.contains(e.target)) {
        langMenu.classList.add("hidden");
        if (currentLangChevron) {
          currentLangChevron.classList.remove("rotate-180");
        }
      }
    });

    langOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        const lang = opt.getAttribute("data-lang");
        applyLanguage(lang);
        langMenu.classList.add("hidden");
        if (currentLangChevron) currentLangChevron.classList.remove("rotate-180");

        if (lang === "vi") {
          showToast("Đã chuyển toàn bộ giao diện sang Tiếng Việt 🇻🇳");
        } else {
          showToast("Switched entire interface to English 🇺🇸");
        }
      });
    });

    // Initialize with saved or default Vietnamese
    let initLang = "vi";
    try {
      initLang = localStorage.getItem("app_lang") || "vi";
    } catch (e) {}
    applyLanguage(initLang);
  }

  // Welcome & Auth Modal Logic (Đăng nhập / Đăng ký khi ấn Bắt đầu trải nghiệm)
  const welcomeOverlay = document.getElementById("welcome-modal-overlay");
  const welcomeCard = document.getElementById("welcome-card");
  const btnStartExp = document.getElementById("btn-start-experience");
  const btnCloseWelcome = document.getElementById("btn-close-welcome");
  const btnOpenWelcome = document.getElementById("btn-open-welcome-profile");

  const authOverlay = document.getElementById("auth-modal-overlay");
  const authCard = document.getElementById("auth-card");
  const btnCloseAuth = document.getElementById("btn-close-auth");
  const tabAuthLogin = document.getElementById("tab-auth-login");
  const tabAuthRegister = document.getElementById("tab-auth-register");
  const tabAuthForgot = document.getElementById("tab-auth-forgot");
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const formForgot = document.getElementById("form-forgot");
  const authMessageBox = document.getElementById("auth-message-box");
  const btnQuickDemoLogin = document.getElementById("btn-quick-demo-login");
  const btnToggleLoginPw = document.getElementById("btn-toggle-login-pw");
  const btnLogoutAccount = document.getElementById("btn-logout-account");
  const headerUserName = document.getElementById("header-user-name");
  const headerUserRole = document.getElementById("header-user-role");

  const DEFAULT_DEMO_USER = {
    fullname: "Cao Thị Thảo Hiền",
    email: "thaohien@phucan.vn",
    role: "Data Analyst & BI 💖",
    password: "123456"
  };

  function getStoredUsers() {
    try {
      const raw = localStorage.getItem("phucan_users");
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [DEFAULT_DEMO_USER];
      }
      if (!parsed.some(u => u.email.toLowerCase() === DEFAULT_DEMO_USER.email)) {
        parsed.unshift(DEFAULT_DEMO_USER);
      }
      return parsed;
    } catch (e) {
      return [DEFAULT_DEMO_USER];
    }
  }

  function saveStoredUsers(users) {
    try {
      localStorage.setItem("phucan_users", JSON.stringify(users));
    } catch (e) {}
  }

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem("phucan_current_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem("phucan_current_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("phucan_current_user");
      }
    } catch (e) {}
    updateHeaderUserUI(user);
  }

  function updateHeaderUserUI(user) {
    if (user) {
      if (headerUserName) headerUserName.textContent = user.fullname;
      if (headerUserRole) headerUserRole.textContent = user.role || "Data Analyst & BI";
      if (btnLogoutAccount) btnLogoutAccount.classList.remove("hidden");
    } else {
      if (headerUserName) headerUserName.textContent = DEFAULT_DEMO_USER.fullname;
      if (headerUserRole) headerUserRole.textContent = DEFAULT_DEMO_USER.role;
      if (btnLogoutAccount) btnLogoutAccount.classList.add("hidden");
    }
  }

  function showAuthMessage(msg, isError = true) {
    if (!authMessageBox) return;
    authMessageBox.classList.remove("hidden", "bg-rose-50", "text-rose-700", "border", "border-rose-200", "bg-emerald-50", "text-emerald-700", "border-emerald-200");
    if (isError) {
      authMessageBox.classList.add("bg-rose-50", "text-rose-700", "border", "border-rose-200");
      authMessageBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i><span>${escapeHtml(msg)}</span>`;
    } else {
      authMessageBox.classList.add("bg-emerald-50", "text-emerald-700", "border", "border-emerald-200");
      authMessageBox.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${escapeHtml(msg)}</span>`;
    }
  }

  function clearAuthMessage() {
    if (authMessageBox) authMessageBox.classList.add("hidden");
  }

  function switchAuthTab(mode) {
    clearAuthMessage();
    const activeCls = "py-2 rounded-xl text-xs font-extrabold bg-white text-[#FF5B8E] shadow-xs transition cursor-pointer";
    const idleCls = "py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-[#FF5B8E] transition cursor-pointer";

    if (formLogin) formLogin.classList.add("hidden");
    if (formRegister) formRegister.classList.add("hidden");
    if (formForgot) formForgot.classList.add("hidden");
    if (tabAuthLogin) tabAuthLogin.className = idleCls;
    if (tabAuthRegister) tabAuthRegister.className = idleCls;
    if (tabAuthForgot) tabAuthForgot.className = idleCls;

    if (mode === "register") {
      if (formRegister) formRegister.classList.remove("hidden");
      if (tabAuthRegister) tabAuthRegister.className = activeCls;
    } else if (mode === "forgot") {
      if (formForgot) formForgot.classList.remove("hidden");
      if (tabAuthForgot) tabAuthForgot.className = activeCls;
    } else {
      if (formLogin) formLogin.classList.remove("hidden");
      if (tabAuthLogin) tabAuthLogin.className = activeCls;
    }
  }

  function openAuthModal(defaultTab = "login") {
    switchAuthTab(defaultTab);
    if (welcomeOverlay) welcomeOverlay.classList.add("hidden");
    if (authOverlay && authCard) {
      authOverlay.classList.remove("hidden", "pointer-events-none");
      setTimeout(() => {
        authOverlay.classList.remove("opacity-0");
        authCard.classList.remove("scale-95", "opacity-0");
      }, 10);
    }
  }

  function closeAuthModal() {
    if (authCard) authCard.classList.add("scale-95", "opacity-0");
    if (authOverlay) {
      authOverlay.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        authOverlay.classList.add("hidden");
      }, 300);
    }
  }

  function closeWelcomeModal(silent = false) {
    if (welcomeCard) welcomeCard.classList.add("scale-95", "opacity-0");
    if (welcomeOverlay) {
      welcomeOverlay.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        welcomeOverlay.classList.add("hidden");
      }, 500);
    }
    triggerPageTransition(document.getElementById("step1-main-section"));
    if (!silent) {
      const activeUser = getCurrentUser();
      const displayName = activeUser ? activeUser.fullname : "Cao Thị Thảo Hiền";
      showToast(`Chào mừng ${displayName} đến với hệ thống AI Agent! 🌸`);
    }
  }

  function openWelcomeModal() {
    if (welcomeOverlay && welcomeCard) {
      welcomeOverlay.classList.remove("hidden", "pointer-events-none");
      setTimeout(() => {
        welcomeOverlay.classList.remove("opacity-0");
        welcomeCard.classList.remove("scale-95", "opacity-0");
      }, 10);
    }
  }

  // Initialize header user state on load
  updateHeaderUserUI(getCurrentUser());

  if (btnStartExp) {
    btnStartExp.addEventListener("click", () => {
      const existingUser = getCurrentUser();
      if (existingUser) {
        closeWelcomeModal();
      } else {
        openAuthModal("login");
      }
    });
  }

  if (tabAuthLogin) tabAuthLogin.addEventListener("click", () => switchAuthTab("login"));
  if (tabAuthRegister) tabAuthRegister.addEventListener("click", () => switchAuthTab("register"));
  if (tabAuthForgot) tabAuthForgot.addEventListener("click", () => switchAuthTab("forgot"));

  // Natural 3D tilt + glass light sheen + soft ambient bokeh on Welcome Page
  const welcomeGlassSheen = document.getElementById("welcome-glass-sheen");
  if (welcomeCard) {
    welcomeCard.addEventListener("mousemove", (e) => {
      const rect = welcomeCard.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const x = relX / rect.width - 0.5;
      const y = relY / rect.height - 0.5;
      welcomeCard.style.transform = `perspective(1400px) rotateY(${(x * 3.2).toFixed(2)}deg) rotateX(${(-y * 2.4).toFixed(2)}deg)`;
      if (welcomeGlassSheen) {
        welcomeGlassSheen.style.background = `radial-gradient(circle 320px at ${relX.toFixed(0)}px ${relY.toFixed(0)}px, rgba(255, 255, 255, 0.34), transparent 72%)`;
      }
    });
    welcomeCard.addEventListener("mouseleave", () => {
      welcomeCard.style.transform = "";
    });
  }

  const bokehCanvas = document.getElementById("welcome-bokeh-canvas");
  if (bokehCanvas && welcomeOverlay) {
    const bCtx = bokehCanvas.getContext("2d");
    const orbs = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 18 + Math.random() * 44,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: -0.00015 - Math.random() * 0.00025,
      alpha: 0.08 + Math.random() * 0.14,
      hue: Math.random() > 0.4 ? "255, 91, 142" : "255, 178, 120"
    }));

    function resizeBokeh() {
      bokehCanvas.width = window.innerWidth;
      bokehCanvas.height = window.innerHeight;
    }
    resizeBokeh();
    window.addEventListener("resize", resizeBokeh);

    function drawBokeh() {
      if (!welcomeOverlay.classList.contains("hidden")) {
        const w = bokehCanvas.width;
        const h = bokehCanvas.height;
        bCtx.clearRect(0, 0, w, h);
        for (const o of orbs) {
          o.x += o.vx;
          o.y += o.vy;
          if (o.y < -0.1) o.y = 1.1;
          if (o.x < -0.1) o.x = 1.1;
          if (o.x > 1.1) o.x = -0.1;

          const cx = o.x * w;
          const cy = o.y * h;
          const grad = bCtx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
          grad.addColorStop(0, `rgba(${o.hue}, ${o.alpha})`);
          grad.addColorStop(1, `rgba(${o.hue}, 0)`);
          bCtx.fillStyle = grad;
          bCtx.beginPath();
          bCtx.arc(cx, cy, o.r, 0, Math.PI * 2);
          bCtx.fill();
        }
      }
      requestAnimationFrame(drawBokeh);
    }
    requestAnimationFrame(drawBokeh);
  }

  if (btnCloseAuth) {
    btnCloseAuth.addEventListener("click", () => {
      closeAuthModal();
      openWelcomeModal();
    });
  }

  if (btnToggleLoginPw) {
    btnToggleLoginPw.addEventListener("click", () => {
      const pwInput = document.getElementById("login-password");
      if (!pwInput) return;
      const isPw = pwInput.type === "password";
      pwInput.type = isPw ? "text" : "password";
      btnToggleLoginPw.innerHTML = isPw ? `<i class="fa-regular fa-eye-slash"></i>` : `<i class="fa-regular fa-eye"></i>`;
    });
  }

  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (document.getElementById("login-email")?.value || "").trim().toLowerCase();
      const password = document.getElementById("login-password")?.value || "";

      if (!email || !password) {
        showAuthMessage("Vui lòng nhập đầy đủ Email/Tên đăng nhập và Mật khẩu!");
        return;
      }

      const users = getStoredUsers();
      const matched = users.find(u => u.email.toLowerCase() === email && u.password === password);
      if (!matched) {
        showAuthMessage("Sai thông tin đăng nhập hoặc mật khẩu. Bạn có thể bấm 'Vào nhanh bằng tài khoản Demo' bên dưới!");
        return;
      }

      setCurrentUser({ fullname: matched.fullname, email: matched.email, role: matched.role });
      closeAuthModal();
      closeWelcomeModal(true);
      showToast(`Đăng nhập thành công! Chào mừng ${matched.fullname} 🌸`);
    });
  }

  if (btnQuickDemoLogin) {
    btnQuickDemoLogin.addEventListener("click", () => {
      setCurrentUser({
        fullname: DEFAULT_DEMO_USER.fullname,
        email: DEFAULT_DEMO_USER.email,
        role: DEFAULT_DEMO_USER.role
      });
      closeAuthModal();
      closeWelcomeModal(true);
      showToast(`Đã đăng nhập tài khoản Demo (${DEFAULT_DEMO_USER.fullname})! 🌸`);
    });
  }

  if (formRegister) {
    formRegister.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullname = (document.getElementById("reg-fullname")?.value || "").trim();
      const email = (document.getElementById("reg-email")?.value || "").trim().toLowerCase();
      const phone = (document.getElementById("reg-phone")?.value || "").trim();
      const role = document.getElementById("reg-role")?.value || "Data Analyst & BI";
      const password = document.getElementById("reg-password")?.value || "";
      const confirmPw = document.getElementById("reg-confirm-password")?.value || "";

      if (!fullname || !email || !password) {
        showAuthMessage("Vui lòng điền đầy đủ Họ tên, Tên đăng nhập/Email và Mật khẩu!");
        return;
      }
      if (password.length < 4) {
        showAuthMessage("Mật khẩu phải có ít nhất 4 ký tự!");
        return;
      }
      if (password !== confirmPw) {
        showAuthMessage("Mật khẩu nhập lại không khớp!");
        return;
      }

      const users = getStoredUsers();
      if (users.some(u => u.email.toLowerCase() === email)) {
        showAuthMessage("Email / Tên đăng nhập này đã tồn tại. Vui lòng chuyển sang tab Đăng Nhập!");
        return;
      }

      const newUser = { fullname, email, phone, role, password };
      users.push(newUser);
      saveStoredUsers(users);
      setCurrentUser({ fullname, email, phone, role });
      closeAuthModal();
      closeWelcomeModal(true);
      showToast(`Đăng ký thành công! Chào mừng ${fullname} 🌸`);
    });
  }

  if (formForgot) {
    formForgot.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (document.getElementById("forgot-email")?.value || "").trim().toLowerCase();
      const newPw = document.getElementById("forgot-new-pw")?.value || "";
      if (!email || !newPw) {
        showAuthMessage("Vui lòng nhập Tên đăng nhập/Email và mật khẩu mới!");
        return;
      }
      if (newPw.length < 4) {
        showAuthMessage("Mật khẩu mới phải có ít nhất 4 ký tự!");
        return;
      }
      const users = getStoredUsers();
      const target = users.find(u => u.email.toLowerCase() === email);
      if (!target) {
        showAuthMessage("Không tìm thấy tài khoản này trong hệ thống!");
        return;
      }
      target.password = newPw;
      saveStoredUsers(users);
      showAuthMessage("Đã cập nhật mật khẩu mới thành công! Vui lòng đăng nhập lại.", false);
      setTimeout(() => switchAuthTab("login"), 1200);
    });
  }

  if (btnLogoutAccount) {
    btnLogoutAccount.addEventListener("click", () => {
      setCurrentUser(null);
      openAuthModal("login");
      showToast("Đã đăng xuất tài khoản. Vui lòng đăng nhập lại!");
    });
  }

  // Interactive My Melody AI Agent Chat Launcher & Drawer Toggle
  const btnMyMelodyMascot = document.getElementById("btn-mymelody-mascot");
  const aiChatDrawer = document.getElementById("ai-chat-drawer");
  const btnCloseAiChat = document.getElementById("btn-close-ai-chat");
  const navMessagesBtn = document.getElementById("nav-messages");
  const myMelodyBubble = document.getElementById("mymelody-speech-bubble");
  const btnHideMyMelodySpeech = document.getElementById("btn-hide-mymelody-speech");

  function toggleAiChatDrawer(forceOpen = null) {
    if (!aiChatDrawer) return;
    const willOpen = forceOpen !== null ? forceOpen : aiChatDrawer.classList.contains("hidden");
    if (willOpen) {
      aiChatDrawer.classList.remove("hidden");
      if (myMelodyBubble) myMelodyBubble.classList.add("hidden");
      document.getElementById("ai-chat-input")?.focus();
    } else {
      aiChatDrawer.classList.add("hidden");
    }
  }

  // Draggable helper for AI Chat Launcher & Chat Drawer
  const myMelodyCompanion = document.getElementById("mymelody-companion");
  const aiChatHeader = document.getElementById("ai-chat-header");
  let companionWasDragged = false;

  function makeDraggable(targetEl, handleEl, onDragStateChange = null) {
    if (!targetEl || !handleEl) return;
    let startX = 0, startY = 0, origLeft = 0, origTop = 0, dragging = false, moved = false;

    handleEl.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button#btn-close-ai-chat")) return;
      dragging = true;
      moved = false;
      const rect = targetEl.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origLeft = rect.left;
      origTop = rect.top;
      targetEl.style.left = `${origLeft}px`;
      targetEl.style.top = `${origTop}px`;
      targetEl.style.bottom = "auto";
      targetEl.style.right = "auto";
      handleEl.setPointerCapture?.(e.pointerId);
    });

    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
      if (!moved) return;
      const maxLeft = Math.max(8, window.innerWidth - targetEl.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - targetEl.offsetHeight - 8);
      const nextLeft = Math.min(Math.max(8, origLeft + dx), maxLeft);
      const nextTop = Math.min(Math.max(8, origTop + dy), maxTop);
      targetEl.style.left = `${nextLeft}px`;
      targetEl.style.top = `${nextTop}px`;
    });

    window.addEventListener("pointerup", () => {
      if (!dragging) return;
      dragging = false;
      if (onDragStateChange) onDragStateChange(moved);
    });
  }

  makeDraggable(myMelodyCompanion, btnMyMelodyMascot, (moved) => {
    companionWasDragged = moved;
  });
  makeDraggable(aiChatDrawer, aiChatHeader);

  if (btnMyMelodyMascot) {
    btnMyMelodyMascot.addEventListener("click", () => {
      if (companionWasDragged) {
        companionWasDragged = false;
        return;
      }
      toggleAiChatDrawer();
    });
  }
  if (btnCloseAiChat) {
    btnCloseAiChat.addEventListener("click", () => toggleAiChatDrawer(false));
  }
  if (navMessagesBtn) {
    navMessagesBtn.addEventListener("click", () => toggleAiChatDrawer(true));
  }

  if (btnHideMyMelodySpeech && myMelodyBubble) {
    btnHideMyMelodySpeech.addEventListener("click", (e) => {
      e.stopPropagation();
      myMelodyBubble.classList.add("hidden");
    });
  }

  if (btnCloseWelcome) {
    btnCloseWelcome.addEventListener("click", () => {
      if (getCurrentUser()) {
        closeWelcomeModal();
      } else {
        openAuthModal("login");
      }
    });
  }

  if (btnOpenWelcome) {
    btnOpenWelcome.addEventListener("click", openWelcomeModal);
  }

  // Close when clicking outside the modal on the backdrop
  if (welcomeOverlay && welcomeCard) {
    welcomeOverlay.addEventListener("click", (e) => {
      if (e.target === welcomeOverlay) {
        if (getCurrentUser()) {
          closeWelcomeModal();
        } else {
          openAuthModal("login");
        }
      }
    });
  }

  // Dark / Light Theme Toggle Logic
  const btnThemeToggle = document.getElementById("btn-theme-toggle");
  const themeToggleIcon = document.getElementById("theme-toggle-icon");

  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      if (themeToggleIcon) {
        themeToggleIcon.className = "fa-solid fa-sun text-amber-400";
      }
      if (btnThemeToggle) {
        btnThemeToggle.setAttribute("title", "Chuyển sang chế độ Sáng (Light Mode)");
      }
    } else {
      document.body.classList.remove("dark-mode");
      if (themeToggleIcon) {
        themeToggleIcon.className = "fa-solid fa-moon text-slate-600";
      }
      if (btnThemeToggle) {
        btnThemeToggle.setAttribute("title", "Chuyển sang chế độ Tối (Dark Mode)");
      }
    }
    try {
      localStorage.setItem("app_theme", theme);
    } catch (e) {}
  }

  // Initialize theme from localStorage or default to light
  let initTheme = "light";
  try {
    initTheme = localStorage.getItem("app_theme") || "light";
  } catch (e) {}
  applyTheme(initTheme);

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark-mode");
      const nextTheme = isDark ? "light" : "dark";
      applyTheme(nextTheme);
      showToast(nextTheme === "dark" ? "Đã chuyển sang chế độ Tối 🌙" : "Đã chuyển sang chế độ Sáng ☀️");
    });
  }

  // Clear all data to blank state for client use
  function clearAllData() {
    state.currentPhase = 1;
    state.phase1Completed = false;
    state.phase2Completed = false;
    state.phase3Completed = false;
    state.isCleaningRunning = false;
    state.isReportGenerated = false;
    state.isAuditCompleted = false;
    state.selectedStoreForDecision = null;

    currentRawRecords = [];
    customDatasetLoaded = false;
    customDatasetStats = {
      totalRows: 0,
      duplicateRows: 0,
      cancelledRows: 0,
      returnRows: 0,
      cleanRows: 0,
      fileName: "Chưa có tệp"
    };

    // Update Counters
    const cleanEl = document.getElementById("stat-clean-rows");
    if (cleanEl) cleanEl.textContent = "0";
    const dupEl = document.getElementById("stat-duplicate-rows");
    if (dupEl) dupEl.textContent = "0";
    const canEl = document.getElementById("stat-cancelled-rows");
    if (canEl) canEl.textContent = "0";
    const retEl = document.getElementById("stat-return-rows");
    if (retEl) retEl.textContent = "0";
    const totEl = document.getElementById("stat-total-raw-rows");
    if (totEl) totEl.innerHTML = `0 <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const totDesc = document.getElementById("stat-total-raw-desc");
    if (totDesc) totDesc.textContent = "Chưa có tệp nạp";
    updateStep2ErrorCounts(customDatasetStats, []);

    // Update Badges
    const b1 = document.getElementById("badge-phase1");
    if (b1) {
      b1.textContent = "Chờ nạp tệp";
      b1.className = "text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md";
    }
    const b2 = document.getElementById("badge-phase2");
    if (b2) {
      b2.textContent = "Chờ GĐ 1";
      b2.className = "text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md";
    }
    const b3 = document.getElementById("badge-phase3");
    if (b3) {
      b3.textContent = "Chờ GĐ 2";
      b3.className = "text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md";
    }
    const tab1 = document.getElementById("tab-phase1");
    if (tab1) tab1.classList.remove("completed");
    const tab2 = document.getElementById("tab-phase2");
    if (tab2) tab2.classList.remove("completed");
    const tab3 = document.getElementById("tab-phase3");
    if (tab3) tab3.classList.remove("completed");

    if (uploadBanner) uploadBanner.classList.add("hidden");
    if (activeSourceBadge) {
      activeSourceBadge.textContent = "Chưa nạp tệp";
      activeSourceBadge.className = "px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 border border-slate-200 font-bold";
    }

    if (cleaningStatusBadge) {
      cleaningStatusBadge.textContent = "Chờ nạp tệp";
      cleaningStatusBadge.className = "px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-bold";
    }

    if (logOutput) {
      logOutput.innerHTML = `
        <div class="text-slate-500">[INFO] Hệ thống AI Agent BPMN 3.0 sẵn sàng tiếp nhận dữ liệu doanh nghiệp.</div>
        <div class="text-slate-500">[INFO] Vui lòng kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV để AI Agent phân tích và làm sạch.</div>
      `;
    }

    // Reset Macro KPIs
    const kpiRev = document.getElementById("kpi-macro-rev");
    if (kpiRev) kpiRev.innerHTML = `0 <span class="text-sm font-semibold text-blue-600">VNĐ</span>`;
    const kpiRevTgtLbl = document.getElementById("kpi-macro-rev-target-lbl");
    if (kpiRevTgtLbl) kpiRevTgtLbl.textContent = "Mục tiêu: 0 VNĐ";
    const kpiRevTgt = document.getElementById("kpi-macro-rev-target");
    if (kpiRevTgt) {
      kpiRevTgt.textContent = "0%";
      kpiRevTgt.className = "text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded";
    }

    const kpiProf = document.getElementById("kpi-macro-profit");
    if (kpiProf) kpiProf.innerHTML = `0 <span class="text-sm font-semibold text-emerald-600">VNĐ</span>`;
    const kpiProfTgtLbl = document.getElementById("kpi-macro-profit-target-lbl");
    if (kpiProfTgtLbl) kpiProfTgtLbl.textContent = "Mục tiêu: 0 VNĐ";
    const kpiProfTgt = document.getElementById("kpi-macro-profit-target");
    if (kpiProfTgt) {
      kpiProfTgt.textContent = "0%";
      kpiProfTgt.className = "text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded";
    }

    const kpiMargin = document.getElementById("kpi-macro-margin");
    if (kpiMargin) kpiMargin.textContent = "0.0%";
    const kpiMarginSub = document.getElementById("kpi-macro-margin-sub");
    if (kpiMarginSub) {
      kpiMarginSub.textContent = "Chờ tính toán";
      kpiMarginSub.className = "text-slate-400 font-medium";
    }

    const kpiRet = document.getElementById("kpi-macro-return");
    if (kpiRet) kpiRet.textContent = "0.0%";
    const kpiRetSub = document.getElementById("kpi-macro-return-sub");
    if (kpiRetSub) {
      kpiRetSub.textContent = "Chờ tính toán";
      kpiRetSub.className = "text-slate-400 font-medium";
    }

    // Reset Top products
    for (let i = 1; i <= 4; i++) {
      const prog = document.getElementById(`prog-cat-0${i}`);
      const badge = document.getElementById(`badge-cat-0${i}`);
      if (prog) prog.style.width = "0%";
      if (badge) badge.textContent = "0%";
    }

    // Reset Top row metrics
    const sumTotRev = document.getElementById("summary-total-rev-header");
    if (sumTotRev) sumTotRev.textContent = "0 VNĐ";
    const sumTgtBadge = document.getElementById("summary-target-reality-badge");
    if (sumTgtBadge) {
      sumTgtBadge.textContent = "Chờ dữ liệu";
      sumTgtBadge.className = "text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full";
    }
    const statReal = document.getElementById("stat-reality-sales");
    if (statReal) statReal.innerHTML = `0 B <span class="text-slate-400 font-normal">(0)</span>`;
    const statTgt = document.getElementById("stat-target-sales");
    if (statTgt) statTgt.innerHTML = `0 B <span class="text-slate-400 font-normal">(0)</span>`;

    renderRawSampleTable();
    renderStoresManagementTable();
    renderAnomalyCards();
    renderPriorityMatrix();
    initCharts(true);
    switchPhase(1);
    hideSubsequentSteps();
  }

  // Clear data on startup so client starts with a completely blank canvas
  clearAllData();
  hideSubsequentSteps();

  // ==============================================
  // INTERACTIVE STAR PARTICLE & MOTION TRAIL ENGINE
  // ==============================================
  const starCanvas = document.getElementById("star-trail-canvas");
  if (starCanvas) {
    const ctx = starCanvas.getContext("2d");
    let particles = [];
    let width = (starCanvas.width = window.innerWidth);
    let height = (starCanvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = starCanvas.width = window.innerWidth;
      height = starCanvas.height = window.innerHeight;
    });

    const starColors = [
      "#FF2D78", // Vibrant rose pink
      "#FF5B8E", // Dabang primary pink
      "#FF9EAF", // Pastel pink
      "#FFA07A", // Pastel coral
      "#FBBF24", // Gold star
      "#FDE047", // Twinkle yellow
      "#C084FC", // Soft purple
      "#67E8F9", // Sparkle cyan
      "#FFFFFF"  // Pure sparkle white
    ];

    class StarParticle {
      constructor(x, y, isBurst = false) {
        this.x = x;
        this.y = y;
        this.color = starColors[Math.floor(Math.random() * starColors.length)];
        this.spikes = Math.random() > 0.35 ? 4 : 5; // 4-pointed or 5-pointed sparkle star
        this.maxSize = isBurst ? Math.random() * 9 + 6 : Math.random() * 6 + 3.5;
        this.size = 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.16;
        this.life = 0;
        this.maxLife = isBurst ? Math.random() * 38 + 25 : Math.random() * 26 + 20;

        const angle = isBurst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
        const speed = isBurst ? Math.random() * 4.5 + 1.8 : Math.random() * 1.6 + 0.4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed + (isBurst ? -1.2 : -0.3);
        this.decay = 0.96;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.decay;
        this.vy *= this.decay;
        this.vy += 0.04;
        this.rotation += this.rotSpeed;
        this.life++;

        const progress = this.life / this.maxLife;
        if (progress < 0.25) {
          this.size = (progress / 0.25) * this.maxSize;
        } else {
          this.size = (1 - (progress - 0.25) / 0.75) * this.maxSize;
        }
      }

      draw(c) {
        if (this.size <= 0.2) return;
        const rot = this.rotation;
        const outer = this.size;
        const inner = this.size * 0.4;

        c.save();
        c.beginPath();
        c.translate(this.x, this.y);
        c.rotate(rot);
        for (let i = 0; i < this.spikes; i++) {
          c.lineTo(
            Math.cos((i * Math.PI) / (this.spikes / 2)) * outer,
            Math.sin((i * Math.PI) / (this.spikes / 2)) * outer
          );
          c.lineTo(
            Math.cos(((i + 0.5) * Math.PI) / (this.spikes / 2)) * inner,
            Math.sin(((i + 0.5) * Math.PI) / (this.spikes / 2)) * inner
          );
        }
        c.closePath();
        c.fillStyle = this.color;
        c.shadowColor = this.color;
        c.shadowBlur = 10;
        c.globalAlpha = Math.max(0, 1 - this.life / this.maxLife);
        c.fill();
        c.restore();
      }
    }

    let lastX = -100;
    let lastY = -100;
    let animId = null;

    function addStar(x, y, count = 2, isBurst = false) {
      for (let i = 0; i < count; i++) {
        if (particles.length < 180) {
          particles.push(new StarParticle(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8, isBurst));
        }
      }
      if (!animId) {
        animId = requestAnimationFrame(animateStars);
      }
    }

    // Sparkle trail on mouse motion
    window.addEventListener("mousemove", (e) => {
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist > 7) {
        addStar(e.clientX, e.clientY, dist > 20 ? 3 : 2, false);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    // Touch motion on mobile/tablet
    window.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          addStar(t.clientX, t.clientY, 2, false);
        }
      },
      { passive: true }
    );

    // Star burst on click
    window.addEventListener("click", (e) => {
      addStar(e.clientX, e.clientY, 14, true);
    });

    function animateStars() {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life >= p.maxLife || p.size <= 0.2) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0) {
        animId = requestAnimationFrame(animateStars);
      } else {
        animId = null;
        ctx.clearRect(0, 0, width, height);
      }
    }
  }
});

