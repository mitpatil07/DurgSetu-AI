# backend/home/action_suggester.py
ACTION_TEMPLATES = {
    "critical": [
        {
            "priority": 1,
            "icon": "🚧",
            "title": "Immediate Area Closure",
            "description": (
                "Barricade a 15-metre safety perimeter around the affected section. "
                "Install warning signs in Marathi, Hindi, and English. Redirect all "
                "tourist and maintenance traffic via alternate routes."
            ),
            "timeline": "Within 2 hours",
            "category": "safety",
        },
        {
            "priority": 1,
            "icon": "🏗️",
            "title": "Emergency Structural Shoring",
            "description": (
                "Deploy temporary steel or timber props to stabilise the compromised "
                "structure and arrest any further movement or collapse. Use trained "
                "heritage scaffolding crew only."
            ),
            "timeline": "Within 24 hours",
            "category": "structural",
        },
        {
            "priority": 2,
            "icon": "👷",
            "title": "Dispatch Conservation Engineer",
            "description": (
                "Send a qualified heritage conservation structural engineer for an "
                "emergency on-site assessment. They must prepare an urgent repair "
                "specification using traditional materials."
            ),
            "timeline": "Within 48 hours",
            "category": "assessment",
        },
        {
            "priority": 2,
            "icon": "🪨",
            "title": "Emergency Masonry Stabilisation",
            "description": (
                "Apply emergency lime grout injection into major cracks. Strap "
                "displaced stone blocks with stainless steel structural ties. "
                "All materials must match the historic construction."
            ),
            "timeline": "Within 1 week",
            "category": "repair",
        },
        {
            "priority": 3,
            "icon": "📸",
            "title": "Full Photogrammetric Documentation",
            "description": (
                "Commission a complete photogrammetric 3D survey of the damaged area "
                "before any repair work commences. This is essential for records, "
                "insurance, and post-repair comparison."
            ),
            "timeline": "Concurrent with shoring",
            "category": "documentation",
        },
        {
            "priority": 3,
            "icon": "📋",
            "title": "File ASI Emergency Notification",
            "description": (
                "Notify the Archaeological Survey of India and the Maharashtra State "
                "Directorate of Archaeology & Museums under Section 30 of the Ancient "
                "Monuments and Archaeological Sites Act, 1958."
            ),
            "timeline": "Within 24 hours",
            "category": "compliance",
        },
    ],
    "high": [
        {
            "priority": 1,
            "icon": "⚠️",
            "title": "Safety Barricading & Signage",
            "description": (
                "Install warning barriers and clear multilingual signage at the "
                "affected section. Evaluate if partial tourist area closure is "
                "needed for visitor safety."
            ),
            "timeline": "Within 24 hours",
            "category": "safety",
        },
        {
            "priority": 2,
            "icon": "🏛️",
            "title": "Heritage Masonry Condition Assessment",
            "description": (
                "Commission a structural assessment by a conservation architect or "
                "heritage engineer. They must document the full extent of damage and "
                "prepare a conservation methodology and bill of quantities."
            ),
            "timeline": "Within 1 week",
            "category": "assessment",
        },
        {
            "priority": 2,
            "icon": "🌿",
            "title": "Vegetation & Root Removal",
            "description": (
                "Engage a qualified arborist to carefully remove invasive plant roots "
                "from mortar joints and wall faces. Avoid mechanical tools near "
                "historic masonry. Apply approved herbicide treatment."
            ),
            "timeline": "Within 1 week",
            "category": "maintenance",
        },
        {
            "priority": 3,
            "icon": "🔧",
            "title": "Hydraulic Lime Mortar Repointing",
            "description": (
                "Repoint eroded and damaged mortar joints using a hydraulic lime "
                "mortar mix matched to the original. No Portland cement to be used. "
                "Joints to be raked back to 25mm before repointing."
            ),
            "timeline": "Within 1 month",
            "category": "repair",
        },
        {
            "priority": 3,
            "icon": "💧",
            "title": "Drainage System Improvement",
            "description": (
                "Clear all blocked weep holes and drainage channels. Improve surface "
                "water runoff gradients to channel water away from the fort masonry. "
                "Install new outlets where blocked channels cannot be cleared."
            ),
            "timeline": "Within 2 weeks",
            "category": "preventive",
        },
        {
            "priority": 4,
            "icon": "📅",
            "title": "Quarterly Monitoring Programme",
            "description": (
                "Establish photographic benchmarks at all affected locations. Assign "
                "a DurgSevak to monitor and report monthly. Review progress at "
                "quarterly heritage committee meetings."
            ),
            "timeline": "Ongoing",
            "category": "monitoring",
        },
    ],
    "medium": [
        {
            "priority": 1,
            "icon": "📐",
            "title": "Systematic Damage Survey",
            "description": (
                "Conduct a measured photographic survey mapping all cracked, eroded, "
                "and damaged sections before any repairs begin. Reference photographs "
                "must be taken at fixed points for future comparison."
            ),
            "timeline": "Within 2 weeks",
            "category": "assessment",
        },
        {
            "priority": 2,
            "icon": "🔧",
            "title": "Lime Mortar Repointing",
            "description": (
                "Repoint all eroded and cracked mortar joints with a hydraulic lime "
                "mortar mix that matches the historic composition. Clean joints "
                "thoroughly before application."
            ),
            "timeline": "Within 1 month",
            "category": "repair",
        },
        {
            "priority": 2,
            "icon": "💧",
            "title": "Drainage & Water Management",
            "description": (
                "Clear blocked drainage channels, repair or install weep holes, "
                "and regrade pathways to direct water away from historic masonry. "
                "Check downpipes and gutters for blockages."
            ),
            "timeline": "Within 2 weeks",
            "category": "preventive",
        },
        {
            "priority": 3,
            "icon": "🌿",
            "title": "Vegetation Management",
            "description": (
                "Remove all vegetation growing in or near masonry joints. Apply "
                "approved biocidal herbicide treatment. Monitor and reapply at "
                "6-monthly intervals."
            ),
            "timeline": "Within 3 weeks",
            "category": "maintenance",
        },
        {
            "priority": 4,
            "icon": "🎨",
            "title": "Protective Lime Wash Coating",
            "description": (
                "Apply a traditional lime wash to treated and repaired stone surfaces "
                "to provide weather protection and restore the historic appearance. "
                "Allow repaired mortar to cure for 4 weeks first."
            ),
            "timeline": "After repointing cures",
            "category": "finishing",
        },
    ],
    "low": [
        {
            "priority": 1,
            "icon": "📸",
            "title": "Photograph & Benchmark",
            "description": (
                "Record the current condition with high-resolution photographs from "
                "fixed reference points. Install benchmark markers if not already "
                "present to detect any future movement."
            ),
            "timeline": "Within 1 month",
            "category": "documentation",
        },
        {
            "priority": 2,
            "icon": "🌿",
            "title": "Biological Growth Treatment",
            "description": (
                "Apply an appropriate biocidal treatment to remove lichen, moss, "
                "and algae. Allow 4–6 weeks for the treatment to take effect before "
                "any further surface work."
            ),
            "timeline": "Within 1 month",
            "category": "maintenance",
        },
        {
            "priority": 3,
            "icon": "🔧",
            "title": "Surface Lime Wash & Minor Repairs",
            "description": (
                "Fill hairline cracks with lime putty. Apply protective lime wash "
                "to treated surfaces. Clear walkways and pathways of accumulated "
                "debris and gravel."
            ),
            "timeline": "Within 2 months",
            "category": "repair",
        },
        {
            "priority": 4,
            "icon": "📋",
            "title": "Include in Routine Maintenance Schedule",
            "description": (
                "Add to the quarterly fort maintenance programme for ongoing "
                "monitoring and minor upkeep. No specialist contractor required "
                "at this stage."
            ),
            "timeline": "Ongoing",
            "category": "monitoring",
        },
    ],
}

KEYWORD_EXTRA_ACTIONS = {
    "crack": {
        "icon": "🔬",
        "title": "Crack Width & Movement Monitoring",
        "description": (
            "Install crack-width monitoring tell-tales at all identified cracks. "
            "Record initial readings and re-check weekly. If movement exceeds "
            "1mm/week, escalate to emergency response."
        ),
        "timeline": "Immediately",
        "priority": 1,
        "category": "monitoring",
    },
    "water": {
        "icon": "💧",
        "title": "Emergency Waterproofing / Drainage",
        "description": (
            "Apply temporary breathable waterproof lime render to prevent further "
            "water ingress. Investigate the source of water penetration and "
            "address root cause (blocked drain, failed roof, etc.)."
        ),
        "timeline": "Within 1 week",
        "priority": 2,
        "category": "preventive",
    },
    "seepage": {
        "icon": "💧",
        "title": "Damp Investigation & Drainage",
        "description": (
            "Engage a building pathologist to identify source of water seepage. "
            "May require excavation adjacent to the wall to inspect the base "
            "and install proper drainage."
        ),
        "timeline": "Within 2 weeks",
        "priority": 2,
        "category": "investigation",
    },
    "collapse": {
        "icon": "🚨",
        "title": "Immediate Evacuation & Structural Shoring",
        "description": (
            "If collapse is imminent or has occurred, immediately evacuate all "
            "persons from the area. Do not enter until a structural engineer "
            "has assessed the risk and authorised re-entry."
        ),
        "timeline": "Immediately",
        "priority": 1,
        "category": "emergency",
    },
    "vegetation": {
        "icon": "🌱",
        "title": "Specialist Vegetation Survey",
        "description": (
            "Commission a botanical survey to identify all plant species growing "
            "in or near the masonry. Some may be protected. Prepare a vegetation "
            "management plan before any removal."
        ),
        "timeline": "Within 2 weeks",
        "priority": 2,
        "category": "assessment",
    },
    "tree": {
        "icon": "🌳",
        "title": "Tree Removal / Root Barrier",
        "description": (
            "Engage a certified arborist to assess root impact and recommend "
            "controlled removal or root barrier installation. Obtain any necessary "
            "felling permission from local authority."
        ),
        "timeline": "Within 2 weeks",
        "priority": 2,
        "category": "maintenance",
    },
}

def get_action_suggestions(report):
    base_actions = list(ACTION_TEMPLATES.get(report.severity, ACTION_TEMPLATES["low"]))
    existing_titles = {a["title"] for a in base_actions}

    text = f"{report.description} {report.suggestions}".lower()
    for keyword, extra in KEYWORD_EXTRA_ACTIONS.items():
        if keyword in text and extra["title"] not in existing_titles:
            base_actions.append(extra)
            existing_titles.add(extra["title"])

    return sorted(base_actions, key=lambda a: a.get("priority", 99))
