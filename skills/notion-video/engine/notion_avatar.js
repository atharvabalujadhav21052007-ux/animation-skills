// ---------- Notion Vector Avatar Generator (Roman Muradov Style) ----------

function makeNotionAvatarSVG(pose = 'thinking', blink = false) {
  const eyeL = blink ? '<line x1="85" y1="95" x2="105" y2="95" stroke="#111" stroke-width="4.5" stroke-linecap="round"/>'
                     : '<ellipse cx="95" cy="95" rx="6.5" ry="8" fill="#111"/>';
  const eyeR = blink ? '<line x1="135" y1="95" x2="155" y2="95" stroke="#111" stroke-width="4.5" stroke-linecap="round"/>'
                     : '<ellipse cx="145" cy="95" rx="6.5" ry="8" fill="#111"/>';

  let bodyPose = '';
  let mouth = '<path d="M110 120 Q120 128 130 120" stroke="#111" stroke-width="3.5" fill="none" stroke-linecap="round"/>';

  if (pose === 'coffee') {
    mouth = '<path d="M110 118 Q120 126 130 118" stroke="#111" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    bodyPose = `
      <!-- Torso -->
      <path d="M70 170 C70 150 170 150 170 170 L180 230 L60 230 Z" fill="#ffffff" stroke="#111" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Coffee Mug -->
      <rect x="105" y="155" width="36" height="42" rx="6" fill="#f8fafc" stroke="#111" stroke-width="4"/>
      <path d="M141 165 C152 165 152 185 141 185" fill="none" stroke="#111" stroke-width="4"/>
      <!-- Steam -->
      <path d="M116 148 Q113 138 119 130" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
      <path d="M128 148 Q131 138 125 130" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
      <!-- Hands holding mug -->
      <path d="M75 185 Q95 180 106 182" stroke="#111" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    `;
  } else if (pose === 'shock') {
    mouth = '<ellipse cx="120" cy="122" rx="10" ry="14" fill="#111"/>';
    bodyPose = `
      <!-- Torso -->
      <path d="M70 170 C70 150 170 150 170 170 L180 230 L60 230 Z" fill="#ffffff" stroke="#111" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Hands to cheeks -->
      <path d="M60 175 Q68 115 80 110" stroke="#111" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M180 175 Q172 115 160 110" stroke="#111" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="78" cy="110" rx="9" ry="8" fill="#ffffff" stroke="#111" stroke-width="3.5"/>
      <ellipse cx="162" cy="110" rx="9" ry="8" fill="#ffffff" stroke="#111" stroke-width="3.5"/>
    `;
  } else if (pose === 'victory') {
    mouth = '<path d="M106 116 Q120 134 134 116 Z" fill="#111"/>';
    bodyPose = `
      <!-- Torso -->
      <path d="M70 170 C70 150 170 150 170 170 L180 230 L60 230 Z" fill="#ffffff" stroke="#111" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Thumbs up -->
      <path d="M165 170 Q185 140 188 120" stroke="#111" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M188 112 L188 126" stroke="#111" stroke-width="5" stroke-linecap="round"/>
    `;
  } else {
    // default thinking
    mouth = '<path d="M112 120 L128 118" stroke="#111" stroke-width="3.5" stroke-linecap="round"/>';
    bodyPose = `
      <!-- Torso -->
      <path d="M70 170 C70 150 170 150 170 170 L180 230 L60 230 Z" fill="#ffffff" stroke="#111" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Hand on chin -->
      <path d="M150 180 Q145 145 130 135" stroke="#111" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="128" cy="136" rx="9" ry="8" fill="#ffffff" stroke="#111" stroke-width="3.5"/>
    `;
  }

  return `
    <svg viewBox="0 0 240 240" width="100%" height="100%">
      <!-- Neck -->
      <rect x="110" y="135" width="20" height="25" fill="#f8fafc" stroke="#111" stroke-width="4"/>
      ${bodyPose}
      <!-- Head -->
      <path d="M75 105 C75 60 165 60 165 105 C165 142 75 142 75 105 Z" fill="#ffffff" stroke="#111" stroke-width="4.5" stroke-linejoin="round"/>
      <!-- Signature Messy Notion Hair -->
      <path d="M70 95 C68 62 85 45 120 45 C155 45 172 62 170 95 C162 70 148 60 120 60 C90 60 78 72 70 95 Z" fill="#111" stroke="#111" stroke-width="2"/>
      <path d="M115 42 Q125 30 135 44" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- Eyebrows -->
      <path d="M85 80 Q95 76 105 80" stroke="#111" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M135 80 Q145 76 155 80" stroke="#111" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Eyes -->
      ${eyeL}
      ${eyeR}
      <!-- Nose -->
      <path d="M120 95 L118 107 L124 107" stroke="#111" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Mouth -->
      ${mouth}
    </svg>
  `;
}

