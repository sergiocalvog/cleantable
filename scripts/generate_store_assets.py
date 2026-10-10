import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "store_assets")
OUTPUT_EN = os.path.join(OUTPUT_DIR, "en")
OUTPUT_ES = os.path.join(OUTPUT_DIR, "es")

os.makedirs(OUTPUT_EN, exist_ok=True)
os.makedirs(OUTPUT_ES, exist_ok=True)

USER_IMG1 = r"C:/Users/scalvo/.gemini/antigravity/brain/e6c515d7-5dd3-4570-bf54-a1a8f4a48d57/.user_uploaded/media_1791611108250_98fb97a8.png"
USER_IMG2 = r"C:/Users/scalvo/.gemini/antigravity/brain/e6c515d7-5dd3-4570-bf54-a1a8f4a48d57/.user_uploaded/media_1791611136373_208c826f.png"
ICON_PATH = os.path.join(BASE_DIR, "icons", "icon128.png")

# Fonts
FONT_REGULAR = "C:/Windows/Fonts/segoeui.ttf"
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_SEMIBOLD = "C:/Windows/Fonts/segoeuisb.ttf"

def get_font(name, size):
    try:
        return ImageFont.truetype(name, size)
    except:
        return ImageFont.load_default()

def draw_gradient_background(width, height, top_color, bottom_color):
    """Draw a smooth vertical linear gradient."""
    base = Image.new("RGB", (width, height), top_color)
    draw = ImageDraw.Draw(base)
    for y in range(height):
        factor = y / float(height)
        r = int(top_color[0] + factor * (bottom_color[0] - top_color[0]))
        g = int(top_color[1] + factor * (bottom_color[1] - top_color[1]))
        b = int(top_color[2] + factor * (bottom_color[2] - top_color[2]))
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return base

def draw_pill(draw, x, y, text, font, bg_color, text_color, border_color=None, padding_x=16, padding_y=8, radius=12):
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    w = tw + padding_x * 2
    h = th + padding_y * 2
    rect = [x, y, x + w, y + h]
    draw.rounded_rectangle(rect, radius=radius, fill=bg_color, outline=border_color, width=1 if border_color else 0)
    draw.text((x + padding_x, y + padding_y - bbox[1]), text, font=font, fill=text_color)
    return w, h

def draw_card(draw, x, y, w, h, bg_color, border_color=None, radius=12):
    draw.rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=bg_color, outline=border_color, width=1 if border_color else 0)

def draw_window_frame(draw, x, y, w, h, title=""):
    # Window header bar
    header_h = 36
    draw.rounded_rectangle([x, y, x + w, y + h], radius=14, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
    draw.rounded_rectangle([x, y, x + w, y + header_h], radius=14, fill=(241, 245, 249))
    draw.rectangle([x, y + header_h - 10, x + w, y + header_h], fill=(241, 245, 249))
    draw.line([(x, y + header_h), (x + w, y + header_h)], fill=(226, 232, 240), width=1)
    
    # Traffic dots
    dot_y = y + 18
    draw.ellipse([x + 16, dot_y - 5, x + 26, dot_y + 5], fill=(239, 68, 68))
    draw.ellipse([x + 34, dot_y - 5, x + 44, dot_y + 5], fill=(245, 158, 11))
    draw.ellipse([x + 52, dot_y - 5, x + 62, dot_y + 5], fill=(16, 185, 129))
    
    if title:
        f = get_font(FONT_SEMIBOLD, 12)
        bbox = f.getbbox(title)
        tw = bbox[2] - bbox[0]
        draw.text((x + (w - tw)//2, y + 10), title, font=f, fill=(100, 116, 139))
    return header_h

# ==============================================================================
# SCREENSHOT 1: Detection & Live Preview
# ==============================================================================
def create_screenshot_1(lang="en"):
    w, h = 1280, 800
    # Clean dark modern background
    img = draw_gradient_background(w, h, (11, 15, 25), (20, 30, 48))
    draw = ImageDraw.Draw(img)
    
    # Subtly glowing decorative circle
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([w//2 - 300, 200, w//2 + 300, 600], fill=(37, 99, 235, 35))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    img.paste(glow, (0, 0), glow)
    draw = ImageDraw.Draw(img)
    
    # Header texts
    if lang == "en":
        pill_txt = "⭐ CHROME EXTENSION"
        title_txt = "Copy Any Web Table to Excel & Sheets in 1 Click"
        sub_txt = "Auto-detects HTML tables & CSS Grid <div>s with live preview & perfect column alignment"
        pills = ["⚡ 1-Click Clipboard TSV", "📊 HTML <table> & CSS Grid", "🛡️ 100% Client-Side & Private"]
        window_title = "E-Commerce Inventory — Chrome & CleanTable"
    else:
        pill_txt = "⭐ EXTENSIÓN PARA CHROME"
        title_txt = "Copia Cualquier Tabla Web a Excel y Sheets en 1 Clic"
        sub_txt = "Detecta tablas HTML y rejillas modernas en <div> con vista previa y alineación perfecta"
        pills = ["⚡ Copia Rápida al Portapapeles", "📊 Tablas HTML y Rejillas <div>", "🛡️ 100% Local y Privado"]
        window_title = "Inventario de Productos — Chrome y CleanTable"

    # Pill
    draw_pill(draw, 64, 40, pill_txt, get_font(FONT_BOLD, 12), (30, 41, 59), (96, 165, 250), border_color=(59, 130, 246))
    
    # Title
    draw.text((64, 76), title_txt, font=get_font(FONT_BOLD, 32), fill=(255, 255, 255))
    # Subtitle
    draw.text((64, 126), sub_txt, font=get_font(FONT_REGULAR, 17), fill=(148, 163, 184))
    
    # Window mockup
    win_x = 64
    win_y = 175
    win_w = 1152
    win_h = 575
    header_h = draw_window_frame(draw, win_x, win_y, win_w, win_h, title=window_title)
    
    # Load user image 1 (real screenshot showing table + popup)
    user_im = Image.open(USER_IMG1)
    # Fit user image into the window content area
    content_w = win_w - 4
    content_h = win_h - header_h - 4
    # Resize user image nicely
    resized_user = user_im.resize((content_w, int(user_im.height * (content_w / user_im.width))), Image.Resampling.LANCZOS)
    # Crop if taller than content_h
    if resized_user.height > content_h:
        resized_user = resized_user.crop((0, 0, content_w, content_h))
    img.paste(resized_user, (win_x + 2, win_y + header_h + 2))
    
    # Draw bottom floating pills over the preview
    pill_x = 80
    pill_y = 710
    draw = ImageDraw.Draw(img)
    for p in pills:
        pw, ph = draw_pill(draw, pill_x, pill_y, p, get_font(FONT_SEMIBOLD, 13), (15, 23, 42), (241, 245, 249), border_color=(51, 65, 85), padding_x=14, padding_y=6, radius=16)
        pill_x += pw + 12

    # Ensure RGB
    return img.convert("RGB")

# ==============================================================================
# SCREENSHOT 2: Smart Data Cleaning Engine
# ==============================================================================
def create_screenshot_2(lang="en"):
    w, h = 1280, 800
    img = draw_gradient_background(w, h, (11, 15, 25), (20, 30, 48))
    draw = ImageDraw.Draw(img)
    
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([150, 250, 750, 650], fill=(16, 185, 129, 25))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    img.paste(glow, (0, 0), glow)
    draw = ImageDraw.Draw(img)
    
    if lang == "en":
        pill_txt = "🧹 SMART CLEANING PIPELINE"
        title_txt = "Strip Currency Symbols, Units & Invisible Spaces"
        sub_txt = "Purges $, €, £, %, kg, and &nbsp; so numbers calculate in Excel & Sheets without text errors"
        b_title = "DIRTY WEB DATA (Text Errors in Excel)"
        a_title = "CLEANTABLE OUTPUT (Ready to Calculate)"
        b1, a1 = "$1,250.50 USD", "1250.50"
        b2, a2 = "1.250,50 €", "1250.50"
        b3, a3 = "84.5% (units)", "84.5"
        b4, a4 = "Item 01\\n\\r", "Item 01"
        b5, a5 = "(&nbsp;$350.00)", "-350.00"
        b_notes = ["Currency treated as text", "European comma crashes formulas", "Unit letters break SUM()", "Multi-line breaks table layout", "Accounting parentheses"]
        a_notes = ["Pure numeric value", "Normalized decimal point", "Clean calculation number", "Single trimmed cell string", "True negative float number"]
        sidebar_title = "Automated Cleaning Options"
    else:
        pill_txt = "🧹 MOTOR DE LIMPIEZA INTELIGENTE"
        title_txt = "Elimina Divisas, Unidades y Espacios Ocultos"
        sub_txt = "Purga $, €, £, %, kg y &nbsp; para que Excel reconozca los números al instante sin fórmulas rotas"
        b_title = "DATOS WEB SUCIOS (Error de texto en Excel)"
        a_title = "SALIDA CLEANTABLE (Listo para Fórmulas)"
        b1, a1 = "$1,250.50 USD", "1250.50"
        b2, a2 = "1.250,50 €", "1250.50"
        b3, a3 = "84.5% (unidades)", "84.5"
        b4, a4 = "Ítem 01\\n\\r", "Ítem 01"
        b5, a5 = "(&nbsp;$350.00)", "-350.00"
        b_notes = ["Divisa tratada como texto", "Coma europea bloquea fórmulas", "Letras de unidad rompen SUM()", "Saltos parten filas al pegar", "Paréntesis contable detectado"]
        a_notes = ["Número puro sin texto", "Punto decimal normalizado", "Número limpio operable", "Línea limpia y sin roturas", "Número negativo real (-350.00)"]
        sidebar_title = "Opciones de Limpieza Activas"

    draw_pill(draw, 64, 40, pill_txt, get_font(FONT_BOLD, 12), (6, 78, 59), (52, 211, 153), border_color=(16, 185, 129))
    draw.text((64, 76), title_txt, font=get_font(FONT_BOLD, 32), fill=(255, 255, 255))
    draw.text((64, 126), sub_txt, font=get_font(FONT_REGULAR, 17), fill=(148, 163, 184))
    
    # Left Card: Before & After comparison table
    card_x = 64
    card_y = 175
    card_w = 660
    card_h = 575
    draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=16, fill=(15, 23, 42), outline=(30, 41, 59), width=2)
    
    # Sub-header bar
    draw.rounded_rectangle([card_x + 16, card_y + 16, card_x + card_w - 16, card_y + 60], radius=8, fill=(30, 41, 59))
    draw.text((card_x + 32, card_y + 27), b_title, font=get_font(FONT_BOLD, 12), fill=(248, 113, 113))
    draw.text((card_x + 360, card_y + 27), a_title, font=get_font(FONT_BOLD, 12), fill=(74, 222, 128))
    
    # Comparison rows
    items = [(b1, a1, b_notes[0], a_notes[0]),
             (b2, a2, b_notes[1], a_notes[1]),
             (b3, a3, b_notes[2], a_notes[2]),
             (b4, a4, b_notes[3], a_notes[3]),
             (b5, a5, b_notes[4], a_notes[4])]
    
    row_y = card_y + 75
    for b_val, a_val, b_n, a_n in items:
        # Row card
        draw.rounded_rectangle([card_x + 16, row_y, card_x + card_w - 16, row_y + 85], radius=10, fill=(24, 32, 47), outline=(40, 53, 72))
        
        # Red side
        draw.rounded_rectangle([card_x + 28, row_y + 12, card_x + 190, row_y + 46], radius=6, fill=(69, 10, 10))
        draw.text((card_x + 38, row_y + 19), b_val, font=get_font(FONT_BOLD, 15), fill=(252, 165, 165))
        draw.text((card_x + 28, row_y + 54), b_n, font=get_font(FONT_REGULAR, 12), fill=(148, 163, 184))
        
        # Arrow
        draw.text((card_x + 265, row_y + 24), "➔", font=get_font(FONT_BOLD, 22), fill=(16, 185, 129))
        
        # Green side
        draw.rounded_rectangle([card_x + 360, row_y + 12, card_x + 500, row_y + 46], radius=6, fill=(6, 78, 59))
        draw.text((card_x + 372, row_y + 19), a_val, font=get_font(FONT_BOLD, 16), fill=(134, 239, 172))
        draw.text((card_x + 360, row_y + 54), a_n, font=get_font(FONT_REGULAR, 12), fill=(148, 163, 184))
        
        row_y += 95
        
    # Right side: Extension popup crop showing cleaning options
    user_im = Image.open(USER_IMG1)
    # Popup is x: 676 to 1024, y: 0 to 535
    popup_crop = user_im.crop((676, 0, 1024, 535))
    
    # Window container for popup
    pop_x = 750
    pop_y = 175
    pop_w = 466
    pop_h = 575
    draw_window_frame(draw, pop_x, pop_y, pop_w, pop_h, title="CleanTable — " + sidebar_title)
    
    # Scale popup to fit nicely
    target_pw = pop_w - 4
    scaled_popup = popup_crop.resize((target_pw, int(popup_crop.height * (target_pw / popup_crop.width))), Image.Resampling.LANCZOS)
    if scaled_popup.height > pop_h - 40:
        scaled_popup = scaled_popup.crop((0, 0, target_pw, pop_h - 40))
    img.paste(scaled_popup, (pop_x + 2, pop_y + 38))
    
    return img.convert("RGB")

# ==============================================================================
# SCREENSHOT 3: Multi-Format Export Suite
# ==============================================================================
def create_screenshot_3(lang="en"):
    w, h = 1280, 800
    img = draw_gradient_background(w, h, (11, 15, 25), (20, 30, 48))
    draw = ImageDraw.Draw(img)
    
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([800, 200, 1200, 600], fill=(37, 99, 235, 35))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    img.paste(glow, (0, 0), glow)
    draw = ImageDraw.Draw(img)
    
    if lang == "en":
        pill_txt = "⚡ 1-CLICK EXPORT SUITE"
        title_txt = "Export to Excel (.xlsx), TSV, CSV, JSON, SQL & Markdown"
        sub_txt = "Instant clipboard copy for Google Sheets plus native typed Excel files with auto-paging"
        cards = [
            ("📋 Copy for Google Sheets (TSV)", "1-click paste directly into Google Sheets or Excel with zero formatting alerts.", (37, 99, 235)),
            ("📗 Native Excel (.xlsx) [PRO]", "True typed numbers, formatted headers & multi-table sheets without warnings.", (16, 185, 129)),
            ("📄 Standard CSV (RFC 4180)", "Universal spreadsheet format with correct quotation and commas.", (100, 116, 139)),
            ("💻 JSON, SQL INSERT & Markdown", "Ready for developers, database seeding, documentation & GitHub tables.", (168, 85, 247)),
            ("🔄 Smart Auto-Paging [PRO]", "Automatically traverses pagination to extract multi-page tables at once.", (234, 88, 12))
        ]
        win_title = "CleanTable — Export Suite"
    else:
        pill_txt = "⚡ SUITE DE EXPORTACIÓN EN 1 CLIC"
        title_txt = "Exporta a Excel (.xlsx), TSV, CSV, JSON, SQL y Markdown"
        sub_txt = "Pega al instante en Google Sheets o descarga hojas de cálculo nativas con paginación"
        cards = [
            ("📋 Copiar para Google Sheets (TSV)", "Pega con 1 clic en Sheets o Excel sin avisos de formato ni texto roto.", (37, 99, 235)),
            ("📗 Descarga Excel (.xlsx) [PRO]", "Números con tipo real, encabezados limpios y compatibilidad total.", (16, 185, 129)),
            ("📄 CSV Estándar (RFC 4180)", "Formato universal para cualquier gestor de datos o CRM.", (100, 116, 139)),
            ("💻 JSON, SQL INSERT y Markdown", "Listo para programadores, bases de datos, APIs y READMEs.", (168, 85, 247)),
            ("🔄 Paginación Automática [PRO]", "Recorre la paginación web y extrae tablas de múltiples páginas de golpe.", (234, 88, 12))
        ]
        win_title = "CleanTable — Opciones de Exportación"

    draw_pill(draw, 64, 40, pill_txt, get_font(FONT_BOLD, 12), (30, 41, 59), (96, 165, 250), border_color=(59, 130, 246))
    draw.text((64, 76), title_txt, font=get_font(FONT_BOLD, 32), fill=(255, 255, 255))
    draw.text((64, 126), sub_txt, font=get_font(FONT_REGULAR, 17), fill=(148, 163, 184))
    
    # Left side: Feature cards
    cx = 64
    cy = 175
    cw = 660
    
    for c_title, c_desc, c_color in cards:
        draw.rounded_rectangle([cx, cy, cx + cw, cy + 98], radius=12, fill=(15, 23, 42), outline=(30, 41, 59), width=1)
        # Color bar on the left
        draw.rounded_rectangle([cx + 6, cy + 12, cx + 12, cy + 86], radius=3, fill=c_color)
        draw.text((cx + 26, cy + 16), c_title, font=get_font(FONT_BOLD, 17), fill=(255, 255, 255))
        draw.text((cx + 26, cy + 48), c_desc, font=get_font(FONT_REGULAR, 13), fill=(148, 163, 184))
        cy += 114

    # Right side: Popup crop from img2 showing exports
    user_im = Image.open(USER_IMG2)
    popup_crop = user_im.crop((676, 0, 1024, 535))
    
    pop_x = 750
    pop_y = 175
    pop_w = 466
    pop_h = 575
    draw_window_frame(draw, pop_x, pop_y, pop_w, pop_h, title=win_title)
    
    target_pw = pop_w - 4
    scaled_popup = popup_crop.resize((target_pw, int(popup_crop.height * (target_pw / popup_crop.width))), Image.Resampling.LANCZOS)
    if scaled_popup.height > pop_h - 40:
        scaled_popup = scaled_popup.crop((0, 0, target_pw, pop_h - 40))
    img.paste(scaled_popup, (pop_x + 2, pop_y + 38))
    
    return img.convert("RGB")

# ==============================================================================
# SMALL PROMO TILE (440 x 280)
# ==============================================================================
def create_small_promo(lang="en"):
    w, h = 440, 280
    img = draw_gradient_background(w, h, (11, 15, 25), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    
    # Glow
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([w//2 - 120, h//2 - 100, w//2 + 120, h//2 + 100], fill=(37, 99, 235, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(50))
    img.paste(glow, (0, 0), glow)
    draw = ImageDraw.Draw(img)
    
    # App Icon (80x80)
    if os.path.exists(ICON_PATH):
        icon = Image.open(ICON_PATH).convert("RGBA").resize((76, 76), Image.Resampling.LANCZOS)
        img.paste(icon, ((w - 76) // 2, 28), icon)
    
    draw = ImageDraw.Draw(img)
    # Title
    t_font = get_font(FONT_BOLD, 26)
    t_text = "CleanTable"
    tb = t_font.getbbox(t_text)
    draw.text(((w - (tb[2]-tb[0])) // 2, 114), t_text, font=t_font, fill=(255, 255, 255))
    
    # Subtitle
    if lang == "en":
        sub_txt = "Copy Web Tables to Excel & Sheets"
        pills_txt = "1-Click TSV · Clean Currencies · Native XLSX"
    else:
        sub_txt = "Copia Tablas Web a Excel y Sheets"
        pills_txt = "1 Clic TSV · Limpia Divisas · Excel Nativo"
        
    s_font = get_font(FONT_SEMIBOLD, 14)
    sb = s_font.getbbox(sub_txt)
    draw.text(((w - (sb[2]-sb[0])) // 2, 152), sub_txt, font=s_font, fill=(147, 197, 253))
    
    # Bottom pills row
    p_font = get_font(FONT_REGULAR, 12)
    pb = p_font.getbbox(pills_txt)
    
    # Card backing
    pill_w = pb[2] - pb[0] + 32
    pill_x = (w - pill_w) // 2
    draw.rounded_rectangle([pill_x, 195, pill_x + pill_w, 235], radius=20, fill=(30, 41, 59), outline=(59, 130, 246), width=1)
    draw.text((pill_x + 16, 206), pills_txt, font=p_font, fill=(241, 245, 249))
    
    return img.convert("RGB")

# ==============================================================================
# MARQUEE PROMO TILE (1400 x 560)
# ==============================================================================
def create_marquee_promo(lang="en"):
    w, h = 1400, 560
    img = draw_gradient_background(w, h, (11, 15, 25), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    
    # Big glowing radial background
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([700, 50, 1350, 500], fill=(37, 99, 235, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    img.paste(glow, (0, 0), glow)
    draw = ImageDraw.Draw(img)
    
    if lang == "en":
        badge_txt = "⭐ CHROME EXTENSION"
        title_txt = "Copy Clean Web Tables\nto Excel & Sheets"
        sub_txt = "Instantly detect HTML & CSS grid tables.\nStrip currency symbols, clean decimals and export\nto Excel (.xlsx), CSV, JSON, and SQL."
        b1 = "⚡ 1-Click Clipboard TSV for Sheets"
        b2 = "🧹 Auto-Clean $, €, £, %, &nbsp; Spaces"
        b3 = "🔒 100% Client-Side & Private (Local Only)"
    else:
        badge_txt = "⭐ EXTENSIÓN PARA CHROME"
        title_txt = "Copia Tablas Web Limpias\na Excel y Sheets"
        sub_txt = "Detecta al instante tablas HTML y rejillas CSS.\nPurga símbolos de moneda, normaliza decimales y exporta\na Excel (.xlsx), CSV, JSON y SQL."
        b1 = "⚡ Copia Rápida TSV para Google Sheets"
        b2 = "🧹 Limpieza Automática de Divisas y Espacios"
        b3 = "🔒 100% Local y Privado (Sin Envío de Datos)"

    # Left content
    lx = 80
    ly = 65
    draw_pill(draw, lx, ly, badge_txt, get_font(FONT_BOLD, 13), (30, 41, 59), (96, 165, 250), border_color=(59, 130, 246))
    
    # Big Title
    draw.text((lx, ly + 46), title_txt, font=get_font(FONT_BOLD, 42), fill=(255, 255, 255), spacing=8)
    
    # Subtitle
    draw.text((lx, ly + 165), sub_txt, font=get_font(FONT_REGULAR, 17), fill=(148, 163, 184), spacing=6)
    
    # 3 Badges
    by = ly + 275
    for b in [b1, b2, b3]:
        draw_pill(draw, lx, by, b, get_font(FONT_SEMIBOLD, 14), (15, 23, 42), (241, 245, 249), border_color=(51, 65, 85), padding_x=16, padding_y=7, radius=18)
        by += 44

    # Right side: Mockup of table and popup
    user_im = Image.open(USER_IMG1)
    
    win_x = 760
    win_y = 60
    win_w = 580
    win_h = 440
    header_h = draw_window_frame(draw, win_x, win_y, win_w, win_h, title="CleanTable — Live Table Extractor")
    
    content_w = win_w - 4
    content_h = win_h - header_h - 4
    resized_user = user_im.resize((content_w, int(user_im.height * (content_w / user_im.width))), Image.Resampling.LANCZOS)
    if resized_user.height > content_h:
        resized_user = resized_user.crop((0, 0, content_w, content_h))
    img.paste(resized_user, (win_x + 2, win_y + header_h + 2))
    
    return img.convert("RGB")

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================
if __name__ == "__main__":
    print("Generating assets...")
    
    # English screenshots
    s1_en = create_screenshot_1("en")
    s1_en.save(os.path.join(OUTPUT_EN, "screenshot-1-detection.png"), "PNG")
    print("Saved EN 1")
    
    s2_en = create_screenshot_2("en")
    s2_en.save(os.path.join(OUTPUT_EN, "screenshot-2-cleaning.png"), "PNG")
    print("Saved EN 2")
    
    s3_en = create_screenshot_3("en")
    s3_en.save(os.path.join(OUTPUT_EN, "screenshot-3-export.png"), "PNG")
    print("Saved EN 3")
    
    # Spanish screenshots
    s1_es = create_screenshot_1("es")
    s1_es.save(os.path.join(OUTPUT_ES, "screenshot-1-deteccion.png"), "PNG")
    print("Saved ES 1")
    
    s2_es = create_screenshot_2("es")
    s2_es.save(os.path.join(OUTPUT_ES, "screenshot-2-limpieza.png"), "PNG")
    print("Saved ES 2")
    
    s3_es = create_screenshot_3("es")
    s3_es.save(os.path.join(OUTPUT_ES, "screenshot-3-exportacion.png"), "PNG")
    print("Saved ES 3")
    
    # Promo small 440x280 (both)
    p_sm_en = create_small_promo("en")
    p_sm_en.save(os.path.join(OUTPUT_DIR, "promo-small-440x280.png"), "PNG")
    p_sm_en.save(os.path.join(OUTPUT_EN, "promo-small-440x280.png"), "PNG")
    
    p_sm_es = create_small_promo("es")
    p_sm_es.save(os.path.join(OUTPUT_ES, "promo-small-440x280.png"), "PNG")
    print("Saved Small Promo Tiles")
    
    # Marquee 1400x560 (both)
    mq_en = create_marquee_promo("en")
    mq_en.save(os.path.join(OUTPUT_DIR, "promo-marquee-1400x560.png"), "PNG")
    mq_en.save(os.path.join(OUTPUT_EN, "promo-marquee-1400x560.png"), "PNG")
    
    mq_es = create_marquee_promo("es")
    mq_es.save(os.path.join(OUTPUT_ES, "promo-marquee-1400x560.png"), "PNG")
    print("Saved Marquee Promo Tiles")
    
    print("\nAll assets generated successfully in 24-bit RGB (no alpha)!")
