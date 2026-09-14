#!/usr/bin/env python3
"""Generate the InnerFlect Mirror V2 procedural 3D glyph kit.

The script intentionally uses only primitive geometry. It writes glTF 2.0
binary files directly, renders deterministic preview images, and creates a
combined showcase model. No third-party models or textures are used.
"""

from __future__ import annotations

import json
import math
import shutil
import struct
import textwrap
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable

import numpy as np
from scipy.spatial import ConvexHull

# matplotlib and Pillow are PREVIEW-only dependencies. They used to be imported
# at module scope, which meant the whole generator refused to run without them
# even when all you wanted was geometry. The GLB path needs numpy and scipy and
# nothing else, so previews import lazily inside the functions that draw them
# and `--no-preview` skips them entirely.


def to_rgb(color: str | tuple[float, float, float]) -> tuple[float, float, float]:
    """Hex string to linear 0-1 floats.

    Replaces matplotlib.colors.to_rgb, which was the single reason the geometry
    path depended on a plotting library. Every colour in MATERIALS is a hex
    string, so that is all this needs to handle.
    """
    if not isinstance(color, str):
        return tuple(float(c) for c in color)  # type: ignore[return-value]
    h = color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        raise ValueError(f"expected a #RRGGBB colour, got {color!r}")
    return tuple(int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))  # type: ignore[return-value]


# Vendored into the app repo: this script is the geometry source of truth, so it
# writes the GLBs straight to where the app serves them. `ROOT` is the kit's own
# folder (manifest, checksums); the models land in public/.
ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]
MODELS_DIR = REPO / "public" / "models" / "innerflect-v2"
PREVIEWS_DIR = ROOT / "previews"
REFERENCE_IMAGE = ROOT.parent / "generated_images" / "exec-fd6726b4-4296-422f-9d84-c3cf88467fe8.png"


@dataclass(frozen=True)
class Material:
    name: str
    color: str
    alpha: float = 1.0
    metallic: float = 0.0
    roughness: float = 0.5
    emissive: str | None = None
    emissive_strength: float = 1.0
    transmission: float = 0.0


@dataclass
class Part:
    name: str
    vertices: np.ndarray
    faces: np.ndarray
    material: str


MATERIALS: dict[str, Material] = {
    "graphite": Material("Graphite", "#111616", metallic=0.72, roughness=0.30),
    "graphite_light": Material("Graphite Light", "#343C3B", metallic=0.58, roughness=0.34),
    "neutral": Material("Human Neutral", "#8A8A85", metallic=0.30, roughness=0.46),
    "white": Material("Warm White", "#F5F5F3", metallic=0.05, roughness=0.32),
    "glass": Material("Smoky Glass", "#8FB3AE", alpha=0.20, roughness=0.08, transmission=0.64),
    "teal_glass": Material(
        "Mirror Glass", "#4F9E94", alpha=0.27, roughness=0.07,
        emissive="#183E39", emissive_strength=0.45, transmission=0.56,
    ),
    "teal": Material(
        "Autonomy Teal", "#4F9E94", metallic=0.22, roughness=0.24,
        emissive="#397F76", emissive_strength=1.65,
    ),
    "teal_bright": Material(
        "Active Teal", "#8AD8CC", metallic=0.10, roughness=0.15,
        emissive="#6FE6D4", emissive_strength=3.0,
    ),
    "amber": Material(
        "Attention Amber", "#E0A100", metallic=0.18, roughness=0.22,
        emissive="#E0A100", emissive_strength=2.6,
    ),
    "amber_glass": Material(
        "Risk Field", "#E0A100", alpha=0.20, roughness=0.08,
        emissive="#8A5A00", emissive_strength=0.75, transmission=0.48,
    ),
}


ASSET_INFO = {
    "company-core": (
        "COMPANY CORE",
        "The organisation above; its living Mirror integrated below.",
    ),
    "domain-platform": (
        "DOMAIN PLATFORM",
        "One portable operating domain in the path value takes through the company.",
    ),
    "human-glyph": (
        "HUMAN GLYPH",
        "Embodied responsibility, judgement, relationships, and authority.",
    ),
    "agent-glyph": (
        "AGENT GLYPH",
        "Computational agency that observes, decides within policy, and acts.",
    ),
    "tool-glyph": (
        "TOOL GLYPH",
        "A software system through which work is read or executed.",
    ),
    "knowledge-object": (
        "KNOWLEDGE OBJECT",
        "Trusted structured company knowledge in use; files are evidence for it.",
    ),
    "workflow-line": (
        "WORKFLOW LINE",
        "Work moving through actors and systems; grey becomes autonomous teal.",
    ),
    "decision-gate": (
        "DECISION GATE",
        "A point where authority, judgement, or explicit approval is required.",
    ),
    "action-pulse": (
        "ACTION PULSE",
        "A discrete autonomous action travelling toward completion.",
    ),
    "risk-hotspot": (
        "RISK HOTSPOT",
        "An identifiable exception, policy conflict, risk, or unsafe condition.",
    ),
    "step-node": (
        "STEP NODE",
        "One concrete step in the canonical seven-stage workflow spine.",
    ),
    "record-token": (
        "RECORD TOKEN",
        "The uniquely identifiable business object moving through an execution.",
    ),
    "verification-marker": (
        "VERIFICATION MARKER",
        "The recorded check of an action and its pass or fail result.",
    ),
    "outcome-marker": (
        "OUTCOME MARKER",
        "An observable, traceable business result rather than completed activity.",
    ),
    "permission-boundary": (
        "PERMISSION BOUNDARY",
        "The authority limit within which an actor may read, decide, or act.",
    ),
}


def unit(vector: np.ndarray) -> np.ndarray:
    length = float(np.linalg.norm(vector))
    if length < 1e-10:
        return np.zeros(3, dtype=float)
    return np.asarray(vector, dtype=float) / length


def rotation_matrix(rotation: tuple[float, float, float]) -> np.ndarray:
    rx, ry, rz = [math.radians(value) for value in rotation]
    cx, sx = math.cos(rx), math.sin(rx)
    cy, sy = math.cos(ry), math.sin(ry)
    cz, sz = math.cos(rz), math.sin(rz)
    mx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]], dtype=float)
    my = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], dtype=float)
    mz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]], dtype=float)
    return mz @ my @ mx


def transform_vertices(
    vertices: np.ndarray,
    translation: tuple[float, float, float] = (0, 0, 0),
    rotation: tuple[float, float, float] = (0, 0, 0),
    scale: tuple[float, float, float] = (1, 1, 1),
) -> np.ndarray:
    matrix = rotation_matrix(rotation)
    scaled = np.asarray(vertices, dtype=float) * np.asarray(scale, dtype=float)
    return scaled @ matrix.T + np.asarray(translation, dtype=float)


def orient_convex_faces(vertices: np.ndarray, faces: np.ndarray) -> np.ndarray:
    centre = vertices.mean(axis=0)
    output = []
    for face in faces:
        a, b, c = vertices[face]
        normal = np.cross(b - a, c - a)
        if np.dot(normal, (a + b + c) / 3.0 - centre) < 0:
            output.append([face[0], face[2], face[1]])
        else:
            output.append(face.tolist())
    return np.asarray(output, dtype=np.int32)


def canonical_faces(faces: np.ndarray) -> np.ndarray:
    """Keep equivalent hull output byte-stable when Qhull changes face order.

    Winding remains untouched: each triangle is only rotated so its smallest
    vertex index comes first, then the rows are sorted. Rotation preserves its
    normal; sorting removes an implementation detail from the GLB bytes.
    """
    canonical: list[list[int]] = []
    for face in np.asarray(faces, dtype=np.int32):
        values = face.tolist()
        first = values.index(min(values))
        canonical.append(values[first:] + values[:first])
    canonical.sort(key=lambda face: (face[0], face[1], face[2]))
    return np.asarray(canonical, dtype=np.int32)


def chamfered_box(size: tuple[float, float, float], bevel: float = 0.08) -> tuple[np.ndarray, np.ndarray]:
    half = np.asarray(size, dtype=float) / 2.0
    bevel = min(float(bevel), float(np.min(half)) * 0.72)
    if bevel <= 1e-5:
        hx, hy, hz = half
        vertices = np.array([
            [-hx, -hy, -hz], [hx, -hy, -hz], [hx, hy, -hz], [-hx, hy, -hz],
            [-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz],
        ], dtype=float)
        faces = np.array([
            [0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7],
            [0, 1, 5], [0, 5, 4], [3, 7, 6], [3, 6, 2],
            [1, 2, 6], [1, 6, 5], [0, 4, 7], [0, 7, 3],
        ], dtype=np.int32)
        return vertices, faces

    hx, hy, hz = half
    points: list[list[float]] = []
    for sx in (-1, 1):
        for sy in (-1, 1):
            for sz in (-1, 1):
                points.extend([
                    [sx * (hx - bevel), sy * hy, sz * hz],
                    [sx * hx, sy * (hy - bevel), sz * hz],
                    [sx * hx, sy * hy, sz * (hz - bevel)],
                ])
    vertices = np.unique(np.round(np.asarray(points, dtype=float), 8), axis=0)
    hull = ConvexHull(vertices)
    faces = canonical_faces(orient_convex_faces(vertices, np.asarray(hull.simplices, dtype=np.int32)))
    return vertices, faces


def low_sphere(radius: float = 0.5, rings: int = 6, segments: int = 10) -> tuple[np.ndarray, np.ndarray]:
    vertices: list[list[float]] = [[0, radius, 0]]
    for ring in range(1, rings):
        phi = math.pi * ring / rings
        for segment in range(segments):
            theta = 2 * math.pi * segment / segments
            vertices.append([
                radius * math.sin(phi) * math.cos(theta),
                radius * math.cos(phi),
                radius * math.sin(phi) * math.sin(theta),
            ])
    bottom = len(vertices)
    vertices.append([0, -radius, 0])
    faces: list[list[int]] = []
    for segment in range(segments):
        nxt = (segment + 1) % segments
        faces.append([0, 1 + segment, 1 + nxt])
    for ring in range(rings - 2):
        start = 1 + ring * segments
        next_start = start + segments
        for segment in range(segments):
            nxt = (segment + 1) % segments
            faces.extend([
                [start + segment, next_start + segment, next_start + nxt],
                [start + segment, next_start + nxt, start + nxt],
            ])
    last_start = 1 + (rings - 2) * segments
    for segment in range(segments):
        nxt = (segment + 1) % segments
        faces.append([last_start + segment, bottom, last_start + nxt])
    verts = np.asarray(vertices, dtype=float)
    return verts, orient_convex_faces(verts, np.asarray(faces, dtype=np.int32))


def frustum(
    height: float = 1.0,
    radius_bottom: float = 0.5,
    radius_top: float = 0.35,
    segments: int = 8,
) -> tuple[np.ndarray, np.ndarray]:
    vertices: list[list[float]] = []
    for y, radius in ((-height / 2, radius_bottom), (height / 2, radius_top)):
        for segment in range(segments):
            theta = 2 * math.pi * segment / segments
            vertices.append([radius * math.cos(theta), y, radius * math.sin(theta)])
    bottom_centre = len(vertices)
    vertices.append([0, -height / 2, 0])
    top_centre = len(vertices)
    vertices.append([0, height / 2, 0])
    faces: list[list[int]] = []
    for segment in range(segments):
        nxt = (segment + 1) % segments
        faces.extend([
            [segment, segments + segment, segments + nxt],
            [segment, segments + nxt, nxt],
            [bottom_centre, nxt, segment],
            [top_centre, segments + segment, segments + nxt],
        ])
    verts = np.asarray(vertices, dtype=float)
    return verts, orient_convex_faces(verts, np.asarray(faces, dtype=np.int32))


def torus(major: float = 0.7, minor: float = 0.08, major_segments: int = 28, minor_segments: int = 8) -> tuple[np.ndarray, np.ndarray]:
    vertices: list[list[float]] = []
    for u_index in range(major_segments):
        u = 2 * math.pi * u_index / major_segments
        for v_index in range(minor_segments):
            v = 2 * math.pi * v_index / minor_segments
            vertices.append([
                (major + minor * math.cos(v)) * math.cos(u),
                minor * math.sin(v),
                (major + minor * math.cos(v)) * math.sin(u),
            ])
    faces: list[list[int]] = []
    for u_index in range(major_segments):
        un = (u_index + 1) % major_segments
        for v_index in range(minor_segments):
            vn = (v_index + 1) % minor_segments
            a = u_index * minor_segments + v_index
            b = un * minor_segments + v_index
            c = un * minor_segments + vn
            d = u_index * minor_segments + vn
            faces.extend([[a, c, b], [a, d, c]])
    return np.asarray(vertices, dtype=float), np.asarray(faces, dtype=np.int32)


def octahedron(radius: float = 0.5) -> tuple[np.ndarray, np.ndarray]:
    vertices = np.array([
        [radius, 0, 0], [-radius, 0, 0], [0, radius, 0],
        [0, -radius, 0], [0, 0, radius], [0, 0, -radius],
    ], dtype=float)
    faces = np.array([
        [2, 0, 4], [2, 4, 1], [2, 1, 5], [2, 5, 0],
        [3, 4, 0], [3, 1, 4], [3, 5, 1], [3, 0, 5],
    ], dtype=np.int32)
    return vertices, orient_convex_faces(vertices, faces)


def tube(points: Iterable[Iterable[float]], radius: float = 0.05, segments: int = 8) -> tuple[np.ndarray, np.ndarray]:
    path = np.asarray(list(points), dtype=float)
    rings: list[np.ndarray] = []
    tangents: list[np.ndarray] = []
    for index in range(len(path)):
        if index == 0:
            tangent = unit(path[1] - path[0])
        elif index == len(path) - 1:
            tangent = unit(path[-1] - path[-2])
        else:
            tangent = unit(path[index + 1] - path[index - 1])
        tangents.append(tangent)
        reference = np.array([0, 1, 0], dtype=float)
        if abs(float(np.dot(tangent, reference))) > 0.88:
            reference = np.array([1, 0, 0], dtype=float)
        normal = unit(np.cross(tangent, reference))
        binormal = unit(np.cross(tangent, normal))
        ring = []
        for segment in range(segments):
            angle = 2 * math.pi * segment / segments
            ring.append(path[index] + radius * (math.cos(angle) * normal + math.sin(angle) * binormal))
        rings.append(np.asarray(ring, dtype=float))
    vertices = np.concatenate(rings, axis=0)
    faces: list[list[int]] = []
    for index in range(len(path) - 1):
        centre_line = (path[index] + path[index + 1]) / 2
        for segment in range(segments):
            nxt = (segment + 1) % segments
            a = index * segments + segment
            b = (index + 1) * segments + segment
            c = (index + 1) * segments + nxt
            d = index * segments + nxt
            for candidate in ([a, b, c], [a, c, d]):
                pa, pb, pc = vertices[candidate]
                normal = np.cross(pb - pa, pc - pa)
                radial = (pa + pb + pc) / 3 - centre_line
                if np.dot(normal, radial) < 0:
                    faces.append([candidate[0], candidate[2], candidate[1]])
                else:
                    faces.append(list(candidate))
    return vertices, np.asarray(faces, dtype=np.int32)


def align_y_to(direction: Iterable[float]) -> np.ndarray:
    direction = unit(np.asarray(direction, dtype=float))
    reference = np.array([0, 0, 1], dtype=float)
    if abs(float(np.dot(direction, reference))) > 0.88:
        reference = np.array([1, 0, 0], dtype=float)
    x_axis = unit(np.cross(direction, reference))
    z_axis = unit(np.cross(x_axis, direction))
    return np.column_stack([x_axis, direction, z_axis])


def make_part(
    name: str,
    geometry: tuple[np.ndarray, np.ndarray],
    material: str,
    translation: tuple[float, float, float] = (0, 0, 0),
    rotation: tuple[float, float, float] = (0, 0, 0),
    scale: tuple[float, float, float] = (1, 1, 1),
    matrix: np.ndarray | None = None,
) -> Part:
    vertices, faces = geometry
    if matrix is not None:
        vertices = np.asarray(vertices, dtype=float) @ matrix.T
        vertices += np.asarray(translation, dtype=float)
    else:
        vertices = transform_vertices(vertices, translation, rotation, scale)
    return Part(name=name, vertices=vertices, faces=np.asarray(faces, dtype=np.int32), material=material)


def shifted(parts: list[Part], offset: tuple[float, float, float], prefix: str = "") -> list[Part]:
    delta = np.asarray(offset, dtype=float)
    return [
        Part(f"{prefix}{part.name}", part.vertices + delta, part.faces.copy(), part.material)
        for part in parts
    ]


def display_plinth(size: float = 3.45) -> list[Part]:
    return [
        make_part("Display_Plinth", chamfered_box((size, 0.18, size), 0.07), "graphite", (0, 0.09, 0)),
        make_part("Display_Glass_Edge", chamfered_box((size * 0.94, 0.08, size * 0.94), 0.04), "glass", (0, 0.22, 0)),
    ]


def company_core() -> list[Part]:
    """The only tall object: company above, Mirror below, one readable seam."""
    return [
        make_part("Core_Footprint", chamfered_box((3.0, 0.18, 3.0), 0.08), "graphite", (0, 0.09, 0)),
        make_part("Mirror_Lower", chamfered_box((2.62, 0.66, 2.62), 0.13), "teal_glass", (0, 0.48, 0)),
        make_part("Mirror_Seam", chamfered_box((2.78, 0.075, 2.78), 0.025), "teal_bright", (0, 0.84, 0)),
        make_part("Company_Upper", chamfered_box((2.36, 0.92, 2.36), 0.14), "glass", (0, 1.34, 0)),
        make_part("Company_Heart", chamfered_box((1.14, 0.70, 1.14), 0.12), "graphite_light", (0, 1.34, 0)),
        make_part("Company_Status", low_sphere(0.11, 4, 8), "teal_bright", (0, 1.35, -0.62)),
    ]


def domain_platform() -> list[Part]:
    """A quiet container. Its contents, not architecture, explain the domain."""
    return [
        make_part("Domain_Shadow", chamfered_box((3.20, 0.16, 2.72), 0.09), "graphite", (0, 0.08, 0)),
        make_part("Domain_Field", chamfered_box((3.02, 0.16, 2.54), 0.075), "teal_glass", (0, 0.22, 0)),
        make_part("Domain_Workplane", chamfered_box((2.72, 0.075, 2.24), 0.04), "glass", (0, 0.34, 0)),
        make_part("Domain_Signal", chamfered_box((1.28, 0.045, 0.055), 0.014), "teal_bright", (0, 0.39, -1.13)),
    ]


def human_glyph() -> list[Part]:
    # Compact enough to sit ON a Step Node. Every part stays neutral at runtime.
    return [
        make_part("Human_Head", low_sphere(0.20, 4, 8), "white", (0, 1.28, 0)),
        make_part("Human_Torso", chamfered_box((0.48, 0.56, 0.30), 0.09), "neutral", (0, 0.88, 0)),
        make_part("Human_Leg_Left", chamfered_box((0.16, 0.50, 0.18), 0.045), "neutral", (-0.14, 0.36, 0)),
        make_part("Human_Leg_Right", chamfered_box((0.16, 0.50, 0.18), 0.045), "neutral", (0.14, 0.36, 0)),
        make_part("Human_Arm_Left", chamfered_box((0.14, 0.50, 0.17), 0.04), "neutral", (-0.32, 0.86, 0), rotation=(0, 0, -4)),
        make_part("Human_Arm_Right", chamfered_box((0.14, 0.50, 0.17), 0.04), "neutral", (0.32, 0.86, 0), rotation=(0, 0, 4)),
    ]


def agent_glyph() -> list[Part]:
    # A machine head, not a robotic person: actor kind is legible by silhouette.
    return [
        make_part("Agent_Stem", chamfered_box((0.10, 0.25, 0.10), 0.025), "graphite_light", (0, 1.47, 0)),
        make_part("Agent_Antenna", low_sphere(0.10, 4, 8), "teal_bright", (0, 1.66, 0)),
        make_part("Agent_Head", chamfered_box((0.92, 0.72, 0.58), 0.14), "graphite_light", (0, 1.02, 0)),
        make_part("Agent_Face", chamfered_box((0.70, 0.46, 0.06), 0.08), "teal_glass", (0, 1.02, -0.31)),
        make_part("Agent_Eye_Left", low_sphere(0.075, 4, 8), "teal_bright", (-0.21, 1.05, -0.36)),
        make_part("Agent_Eye_Right", low_sphere(0.075, 4, 8), "teal_bright", (0.21, 1.05, -0.36)),
        make_part("Agent_Base", frustum(0.28, 0.38, 0.28, 8), "graphite", (0, 0.30, 0)),
        make_part("Agent_Neck", chamfered_box((0.18, 0.48, 0.18), 0.04), "graphite_light", (0, 0.60, 0)),
    ]


def tool_glyph() -> list[Part]:
    # Three stacked cylinders are the universal system/database silhouette.
    return [
        make_part("Tool_Lower", frustum(0.34, 0.48, 0.48, 12), "graphite", (0, 0.30, 0)),
        make_part("Tool_Middle", frustum(0.34, 0.48, 0.48, 12), "graphite_light", (0, 0.65, 0)),
        make_part("Tool_Upper", frustum(0.34, 0.48, 0.48, 12), "graphite_light", (0, 1.00, 0)),
        make_part("Tool_Status", torus(0.39, 0.035, 24, 6), "teal_bright", (0, 1.18, 0)),
    ]


def knowledge_object() -> list[Part]:
    # A structured source in use. Upright and planar, unlike the Tool cylinder.
    return [
        make_part("Knowledge_Back", chamfered_box((0.92, 1.28, 0.14), 0.07), "graphite_light", (0, 0.72, 0)),
        make_part("Knowledge_Face", chamfered_box((0.72, 1.02, 0.055), 0.04), "glass", (0, 0.74, -0.09)),
        make_part("Knowledge_Title", chamfered_box((0.43, 0.055, 0.025), 0.012), "teal_bright", (-0.08, 0.99, -0.13)),
        make_part("Knowledge_Line_1", chamfered_box((0.50, 0.035, 0.022), 0.010), "neutral", (0, 0.76, -0.13)),
        make_part("Knowledge_Line_2", chamfered_box((0.38, 0.035, 0.022), 0.010), "neutral", (-0.06, 0.59, -0.13)),
        make_part("Knowledge_Line_3", chamfered_box((0.46, 0.035, 0.022), 0.010), "neutral", (-0.02, 0.42, -0.13)),
    ]


def workflow_line() -> list[Part]:
    # A unit connector. Runtime stretches/curves it between record-backed nodes.
    direction = np.array([1.0, 0.0, 0.0])
    return [
        make_part("Flow_Rail", tube([(-1.25, 0.18, 0), (1.03, 0.18, 0)], 0.035, 6), "teal"),
        make_part("Flow_Arrow", frustum(0.38, 0.15, 0.0, 8), "teal_bright", (1.18, 0.18, 0), matrix=align_y_to(direction)),
        make_part("Flow_Origin", low_sphere(0.075, 4, 8), "teal_bright", (-1.25, 0.18, 0)),
    ]


def decision_gate() -> list[Part]:
    # Diamond footprint is reserved for branching/authority, in both 2D and 3D.
    return [
        make_part("Gate_Base", chamfered_box((1.18, 0.22, 1.18), 0.08), "graphite", (0, 0.11, 0), rotation=(0, 45, 0)),
        make_part("Gate_Surface", chamfered_box((0.98, 0.18, 0.98), 0.07), "teal_glass", (0, 0.27, 0), rotation=(0, 45, 0)),
        make_part("Gate_Centre", octahedron(0.18), "amber", (0, 0.52, 0)),
        make_part("Gate_Input", low_sphere(0.07, 4, 8), "neutral", (-0.86, 0.20, 0)),
        make_part("Gate_Yes", low_sphere(0.07, 4, 8), "amber", (0.86, 0.20, 0)),
        make_part("Gate_No", low_sphere(0.07, 4, 8), "amber", (0, 0.20, 0.86)),
    ]


def action_pulse() -> list[Part]:
    # An event OVER a path, never a second connector sculpture.
    return [
        make_part("Pulse_Outer", torus(0.48, 0.035, 24, 6), "teal_glass", (0, 0.10, 0)),
        make_part("Pulse_Middle", torus(0.31, 0.045, 24, 6), "teal", (0, 0.13, 0)),
        make_part("Pulse_Core", low_sphere(0.17, 5, 10), "teal_bright", (0, 0.20, 0)),
    ]


def risk_hotspot() -> list[Part]:
    # Small overlay attached to the affected step, not its own environment.
    return [
        make_part("Risk_Field", torus(0.50, 0.035, 24, 6), "amber_glass", (0, 0.11, 0)),
        make_part("Risk_Body", octahedron(0.34), "amber", (0, 0.48, 0)),
        make_part("Risk_Mark", chamfered_box((0.075, 0.30, 0.075), 0.018), "white", (0, 0.52, -0.25)),
        make_part("Risk_Point", low_sphere(0.055, 4, 8), "white", (0, 0.30, -0.25)),
    ]


def step_node() -> list[Part]:
    # The repeated primary unit. Actors/content compose on top; attachments sit beside it.
    return [
        make_part("Step_Base", chamfered_box((1.52, 0.20, 1.52), 0.11), "graphite", (0, 0.10, 0)),
        make_part("Step_Surface", chamfered_box((1.30, 0.18, 1.30), 0.095), "teal_glass", (0, 0.25, 0)),
        make_part("Step_Inset", chamfered_box((0.76, 0.065, 0.76), 0.05), "glass", (0, 0.37, 0)),
        make_part("Step_Input", low_sphere(0.065, 4, 8), "teal_bright", (-0.83, 0.23, 0)),
        make_part("Step_Output", low_sphere(0.065, 4, 8), "teal_bright", (0.83, 0.23, 0)),
        make_part("Step_Attachment", low_sphere(0.055, 4, 8), "teal", (0, 0.23, 0.83)),
    ]


def record_token() -> list[Part]:
    # A compact identity puck that can visibly travel without hiding the path.
    return [
        make_part("Record_Rim", frustum(0.18, 0.34, 0.34, 12), "graphite_light", (0, 0.10, 0)),
        make_part("Record_Core", frustum(0.15, 0.25, 0.25, 12), "teal_bright", (0, 0.23, 0)),
        make_part("Record_Identity", chamfered_box((0.22, 0.055, 0.07), 0.014), "white", (0, 0.32, -0.12)),
    ]


def verification_marker() -> list[Part]:
    # Ring terminal with an unmistakable physical check mark.
    return [
        make_part("Verification_Base", frustum(0.20, 0.72, 0.72, 10), "graphite", (0, 0.10, 0)),
        make_part("Verification_Field", frustum(0.15, 0.58, 0.58, 10), "teal_glass", (0, 0.25, 0)),
        make_part("Verification_Ring", torus(0.40, 0.045, 24, 6), "teal", (0, 0.35, 0)),
        make_part("Verification_Tick_A", tube([(-0.25, 0.40, -0.02), (-0.07, 0.27, -0.02)], 0.045, 6), "teal_bright"),
        make_part("Verification_Tick_B", tube([(-0.07, 0.27, -0.02), (0.28, 0.52, -0.02)], 0.045, 6), "teal_bright"),
    ]


def outcome_marker() -> list[Part]:
    # A flag terminates the journey; unlike Verification it makes no pass/fail claim.
    return [
        make_part("Outcome_Base", frustum(0.18, 0.63, 0.63, 10), "graphite", (0, 0.09, 0)),
        make_part("Outcome_Field", frustum(0.14, 0.50, 0.50, 10), "teal_glass", (0, 0.22, 0)),
        make_part("Outcome_Post", chamfered_box((0.09, 1.12, 0.09), 0.02), "teal_bright", (-0.15, 0.82, 0)),
        make_part("Outcome_Flag", chamfered_box((0.52, 0.34, 0.075), 0.035), "teal_bright", (0.14, 1.17, 0)),
        make_part("Outcome_Result", low_sphere(0.08, 4, 8), "white", (-0.15, 0.27, -0.39)),
    ]


def permission_boundary() -> list[Part]:
    """A normalised unit cage. Runtime scales/repeats it to an authority scope."""
    parts = [
        make_part("Boundary_Field", chamfered_box((1.50, 0.035, 1.50), 0.02), "teal_glass", (0, 0.04, 0)),
    ]
    for index, (x, z) in enumerate(((-0.75, -0.75), (0.75, -0.75), (-0.75, 0.75), (0.75, 0.75))):
        parts.append(make_part(f"Boundary_Post_{index+1}", chamfered_box((0.055, 1.15, 0.055), 0.014), "graphite_light", (x, 0.59, z)))
    for index, (x, z, sx, sz) in enumerate(((0, -0.75, 1.55, 0.055), (0, 0.75, 1.55, 0.055), (-0.75, 0, 0.055, 1.55), (0.75, 0, 0.055, 1.55))):
        parts.append(make_part(f"Boundary_Top_{index+1}", chamfered_box((sx, 0.055, sz), 0.014), "teal_bright", (x, 1.16, z)))
    return parts


ASSET_BUILDERS: dict[str, Callable[[], list[Part]]] = {
    "company-core": company_core,
    "domain-platform": domain_platform,
    "human-glyph": human_glyph,
    "agent-glyph": agent_glyph,
    "tool-glyph": tool_glyph,
    "knowledge-object": knowledge_object,
    "workflow-line": workflow_line,
    "decision-gate": decision_gate,
    "action-pulse": action_pulse,
    "risk-hotspot": risk_hotspot,
    "step-node": step_node,
    "record-token": record_token,
    "verification-marker": verification_marker,
    "outcome-marker": outcome_marker,
    "permission-boundary": permission_boundary,
}


def hex_rgba(material: Material) -> tuple[float, float, float, float]:
    r, g, b = to_rgb(material.color)
    return float(r), float(g), float(b), material.alpha


def gltf_material(material: Material) -> dict:
    r, g, b, a = hex_rgba(material)
    result: dict = {
        "name": material.name,
        "pbrMetallicRoughness": {
            "baseColorFactor": [r, g, b, a],
            "metallicFactor": material.metallic,
            "roughnessFactor": material.roughness,
        },
        "doubleSided": material.alpha < 1.0,
    }
    if material.alpha < 1.0:
        result["alphaMode"] = "BLEND"
    if material.emissive:
        er, eg, eb = to_rgb(material.emissive)
        result["emissiveFactor"] = [er, eg, eb]
        result.setdefault("extensions", {})["KHR_materials_emissive_strength"] = {
            "emissiveStrength": material.emissive_strength,
        }
    if material.transmission > 0:
        result.setdefault("extensions", {})["KHR_materials_transmission"] = {
            "transmissionFactor": material.transmission,
        }
        result.setdefault("extensions", {})["KHR_materials_ior"] = {"ior": 1.42}
    return result


def pad4(data: bytearray, pad_byte: int = 0) -> None:
    while len(data) % 4:
        data.append(pad_byte)


def write_glb(parts: list[Part], output: Path, title: str, semantic: str) -> dict:
    used_names = [name for name in MATERIALS if any(part.material == name for part in parts)]
    material_indices = {name: index for index, name in enumerate(used_names)}
    binary = bytearray()
    buffer_views: list[dict] = []
    accessors: list[dict] = []
    meshes: list[dict] = []
    nodes: list[dict] = []
    vertex_total = 0
    triangle_total = 0

    for part in parts:
        triangles = part.vertices[part.faces]
        positions = triangles.reshape(-1, 3).astype("<f4")
        normals_per_face = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])
        lengths = np.linalg.norm(normals_per_face, axis=1, keepdims=True)
        lengths[lengths < 1e-10] = 1.0
        normals_per_face = normals_per_face / lengths
        normals = np.repeat(normals_per_face, 3, axis=0).astype("<f4")

        position_offset = len(binary)
        binary.extend(positions.tobytes())
        pad4(binary)
        position_view = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": position_offset, "byteLength": positions.nbytes, "target": 34962})
        position_accessor = len(accessors)
        accessors.append({
            "bufferView": position_view,
            "componentType": 5126,
            "count": int(len(positions)),
            "type": "VEC3",
            "min": positions.min(axis=0).astype(float).tolist(),
            "max": positions.max(axis=0).astype(float).tolist(),
        })

        normal_offset = len(binary)
        binary.extend(normals.tobytes())
        pad4(binary)
        normal_view = len(buffer_views)
        buffer_views.append({"buffer": 0, "byteOffset": normal_offset, "byteLength": normals.nbytes, "target": 34962})
        normal_accessor = len(accessors)
        accessors.append({
            "bufferView": normal_view,
            "componentType": 5126,
            "count": int(len(normals)),
            "type": "VEC3",
        })

        mesh_index = len(meshes)
        meshes.append({
            "name": part.name,
            "primitives": [{
                "attributes": {"POSITION": position_accessor, "NORMAL": normal_accessor},
                "material": material_indices[part.material],
                "mode": 4,
            }],
        })
        nodes.append({"name": part.name, "mesh": mesh_index})
        vertex_total += int(len(positions))
        triangle_total += int(len(part.faces))

    all_vertices = np.concatenate([part.vertices for part in parts], axis=0)
    document = {
        "asset": {"version": "2.0", "generator": "InnerFlect Mirror Procedural Glyph Generator 1.0"},
        "scene": 0,
        "scenes": [{"name": title, "nodes": list(range(len(nodes)))}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": [gltf_material(MATERIALS[name]) for name in used_names],
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(binary)}],
        "extensionsUsed": [
            "KHR_materials_emissive_strength",
            "KHR_materials_ior",
            "KHR_materials_transmission",
        ],
        "extras": {
            "system": "InnerFlect Mirror V2",
            "semantic": semantic,
            "coordinateSystem": "Y-up",
            "unit": "metre",
        },
    }
    json_bytes = bytearray(json.dumps(document, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))
    pad4(json_bytes, 0x20)
    pad4(binary, 0)
    total_length = 12 + 8 + len(json_bytes) + 8 + len(binary)
    with output.open("wb") as handle:
        handle.write(struct.pack("<4sII", b"glTF", 2, total_length))
        handle.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        handle.write(json_bytes)
        handle.write(struct.pack("<II", len(binary), 0x004E4942))
        handle.write(binary)

    dimensions = all_vertices.max(axis=0) - all_vertices.min(axis=0)
    return {
        "file": f"public/models/innerflect-v2/{output.name}",
        # The glTF material NAME on each mesh is the contract the runtime role map
        # keys on -- "Active Teal", not the internal key "teal_bright". Emitting it
        # here is what lets an unmapped material become a compile error instead of
        # a silent fallback.
        "materialNames": [MATERIALS[name].name for name in used_names],
        "parts": len(parts),
        "vertices": vertex_total,
        "triangles": triangle_total,
        "dimensions": {"x": round(float(dimensions[0]), 4), "y": round(float(dimensions[1]), 4), "z": round(float(dimensions[2]), 4)},
        "bytes": output.stat().st_size,
    }


def validate_glb(path: Path) -> None:
    raw = path.read_bytes()
    if len(raw) < 20:
        raise ValueError(f"{path.name}: file too short")
    magic, version, total = struct.unpack_from("<4sII", raw, 0)
    if magic != b"glTF" or version != 2 or total != len(raw):
        raise ValueError(f"{path.name}: invalid GLB header")
    json_length, json_type = struct.unpack_from("<II", raw, 12)
    if json_type != 0x4E4F534A:
        raise ValueError(f"{path.name}: missing JSON chunk")
    document = json.loads(raw[20:20 + json_length].decode("utf-8").rstrip(" \x00"))
    binary_header = 20 + json_length
    bin_length, bin_type = struct.unpack_from("<II", raw, binary_header)
    if bin_type != 0x004E4942:
        raise ValueError(f"{path.name}: missing BIN chunk")
    if document["buffers"][0]["byteLength"] > bin_length:
        raise ValueError(f"{path.name}: declared buffer exceeds BIN chunk")
    for accessor in document["accessors"]:
        if accessor["count"] <= 0:
            raise ValueError(f"{path.name}: empty accessor")


def render_asset(parts: list[Part], output: Path, transparent: bool = True) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection

    figure = plt.figure(figsize=(5.5, 5.5), dpi=160, facecolor=(0, 0, 0, 0) if transparent else "#070B0B")
    axis = figure.add_subplot(111, projection="3d")
    axis.set_facecolor((0, 0, 0, 0) if transparent else "#070B0B")
    light = unit(np.array([-0.42, -0.20, 0.88]))
    ordered = sorted(parts, key=lambda part: MATERIALS[part.material].alpha < 0.99)
    for part in ordered:
        material = MATERIALS[part.material]
        display_vertices = part.vertices[:, [0, 2, 1]]
        triangles = display_vertices[part.faces]
        face_colours = []
        base = np.asarray(to_rgb(material.color), dtype=float)
        emissive = np.asarray(to_rgb(material.emissive), dtype=float) if material.emissive else np.zeros(3)
        for triangle in triangles:
            normal = unit(np.cross(triangle[1] - triangle[0], triangle[2] - triangle[0]))
            intensity = 0.52 + 0.62 * max(0.0, float(np.dot(normal, light)))
            ambient = np.array([0.018, 0.024, 0.024])
            colour = np.clip(base * intensity + ambient + emissive * 0.18 * material.emissive_strength, 0, 1)
            face_colours.append([*colour.tolist(), material.alpha])
        edge_rgb = np.clip(base * 1.75 + 0.055 + emissive * 0.32, 0, 1)
        collection = Poly3DCollection(
            triangles,
            facecolors=face_colours,
            edgecolors=[(*edge_rgb.tolist(), min(0.92, max(0.18, material.alpha + 0.24)))],
            linewidths=0.42 if material.alpha < 1 else 0.24,
            antialiased=True,
        )
        collection.set_zsort("average")
        axis.add_collection3d(collection)

    vertices = np.concatenate([part.vertices for part in parts], axis=0)[:, [0, 2, 1]]
    minimum, maximum = vertices.min(axis=0), vertices.max(axis=0)
    centre = (minimum + maximum) / 2
    span = max(float(np.max(maximum - minimum)), 3.1) * 0.62
    axis.set_xlim(centre[0] - span, centre[0] + span)
    axis.set_ylim(centre[1] - span, centre[1] + span)
    axis.set_zlim(max(-0.08, centre[2] - span * 0.90), centre[2] + span * 1.10)
    axis.set_box_aspect((1, 1, 1))
    axis.view_init(elev=25, azim=-52)
    axis.set_proj_type("ortho")
    axis.set_axis_off()
    figure.subplots_adjust(0, 0, 1, 1)
    figure.savefig(output, transparent=transparent, bbox_inches="tight", pad_inches=0)
    plt.close(figure)


def add_glow(image: "Image.Image") -> "Image.Image":
    from PIL import Image, ImageFilter

    rgba = image.convert("RGBA")
    pixels = np.asarray(rgba).copy()
    alpha = pixels[:, :, 3]
    teal_mask = ((pixels[:, :, 1] > pixels[:, :, 0] * 1.12) & (pixels[:, :, 1] > 70) & (alpha > 12)).astype(np.uint8) * alpha
    amber_mask = ((pixels[:, :, 0] > pixels[:, :, 2] * 1.45) & (pixels[:, :, 1] > 55) & (alpha > 12)).astype(np.uint8) * alpha
    teal = Image.new("RGBA", rgba.size, (92, 227, 207, 0))
    amber = Image.new("RGBA", rgba.size, (224, 161, 0, 0))
    teal.putalpha(Image.fromarray(teal_mask).filter(ImageFilter.GaussianBlur(18)))
    amber.putalpha(Image.fromarray(amber_mask).filter(ImageFilter.GaussianBlur(18)))
    glow = Image.alpha_composite(teal, amber)
    glow = Image.alpha_composite(glow, rgba)
    return glow


def load_font(size: int, bold: bool = False) -> "ImageFont.FreeTypeFont":
    from PIL import ImageFont

    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationMono-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def make_contact_sheet(render_paths: dict[str, Path], output: Path) -> None:
    from PIL import Image, ImageDraw

    width, height = 3200, 2450
    yy, xx = np.mgrid[0:height, 0:width]
    radial = np.sqrt(((xx - width * 0.50) / width) ** 2 + ((yy - height * 0.43) / height) ** 2)
    vignette = np.clip(1.0 - radial * 1.15, 0, 1)
    background = np.zeros((height, width, 4), dtype=np.uint8)
    background[:, :, 0] = (5 + vignette * 4).astype(np.uint8)
    background[:, :, 1] = (9 + vignette * 8).astype(np.uint8)
    background[:, :, 2] = (9 + vignette * 8).astype(np.uint8)
    background[:, :, 3] = 255
    board = Image.fromarray(background, "RGBA")
    draw = ImageDraw.Draw(board, "RGBA")

    title_font = load_font(56, bold=True)
    eyebrow_font = load_font(22, bold=True)
    label_font = load_font(24, bold=True)
    body_font = load_font(18)
    number_font = load_font(18, bold=True)
    draw.text((82, 55), "INNERFLECT MIRROR", font=eyebrow_font, fill=(138, 216, 204, 235))
    draw.text((82, 92), "V2 · OPERATIONAL GLYPH SYSTEM", font=title_font, fill=(245, 245, 243, 255))
    draw.text((82, 163), "Fifteen semantic assets · Shape identifies kind · State decides colour", font=body_font, fill=(138, 138, 133, 240))
    draw.line((82, 216, width - 82, 216), fill=(79, 158, 148, 95), width=2)

    margin_x = 66
    top = 250
    gap_x = 20
    gap_y = 22
    cell_width = (width - 2 * margin_x - 4 * gap_x) // 5
    cell_height = (height - top - 58 - 2 * gap_y) // 3
    slugs = list(ASSET_BUILDERS)
    for index, slug in enumerate(slugs):
        row, column = divmod(index, 5)
        x0 = margin_x + column * (cell_width + gap_x)
        y0 = top + row * (cell_height + gap_y)
        x1, y1 = x0 + cell_width, y0 + cell_height
        draw.rounded_rectangle((x0, y0, x1, y1), radius=22, fill=(10, 16, 16, 188), outline=(79, 158, 148, 46), width=2)
        draw.text((x0 + 20, y0 + 18), f"{index + 1:02d}", font=number_font, fill=(79, 158, 148, 230))

        render = add_glow(Image.open(render_paths[slug]))
        render.thumbnail((cell_width - 35, cell_height - 155), Image.Resampling.LANCZOS)
        px = x0 + (cell_width - render.width) // 2
        py = y0 + 27 + (cell_height - 165 - render.height) // 2
        board.alpha_composite(render, (px, py))

        label, description = ASSET_INFO[slug]
        label_y = y1 - 104
        draw.text((x0 + 20, label_y), label, font=label_font, fill=(245, 245, 243, 255))
        lines = textwrap.wrap(description, width=46)
        for line_index, line in enumerate(lines[:2]):
            draw.text((x0 + 20, label_y + 38 + line_index * 23), line, font=body_font, fill=(138, 138, 133, 235))

    board.convert("RGB").save(output, quality=96)


def build_showcase(assets: dict[str, list[Part]]) -> list[Part]:
    showcase: list[Part] = []
    x_positions = (-9.2, -4.6, 0.0, 4.6, 9.2)
    z_positions = (5.6, 0.0, -5.6)
    for index, (slug, parts) in enumerate(assets.items()):
        row, column = divmod(index, 5)
        offset = (x_positions[column], 0, z_positions[row])
        showcase.extend(shifted(display_plinth(), offset, f"{slug}_display_"))
        showcase.extend(shifted(parts, (offset[0], 0.24, offset[2]), f"{slug}_"))
    return showcase


def main(previews: bool = False) -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    if previews:
        PREVIEWS_DIR.mkdir(parents=True, exist_ok=True)
    assets: dict[str, list[Part]] = {slug: builder() for slug, builder in ASSET_BUILDERS.items()}
    stats: dict[str, dict] = {}
    renders: dict[str, Path] = {}

    for slug, parts in assets.items():
        label, description = ASSET_INFO[slug]
        glb_path = MODELS_DIR / f"{slug}.glb"
        stats[slug] = write_glb(parts, glb_path, label, description)
        validate_glb(glb_path)
        if previews:
            render_path = PREVIEWS_DIR / f"{slug}.png"
            render_asset(shifted(parts, (0, 0.03, 0)), render_path)
            renders[slug] = render_path

    # The showcase is a single 566KB model that only the kit's own contact sheet
    # uses. It follows previews rather than shipping to public/, where it would be
    # real bandwidth on every uncached request.
    if previews:
        showcase = build_showcase(assets)
        showcase_path = PREVIEWS_DIR / "innerflect-v2-showcase.glb"
        stats["innerflect-v2-showcase"] = write_glb(
            showcase,
            showcase_path,
            "INNERFLECT MIRROR V2 SHOWCASE",
            "A display scene containing all fifteen V2 operational glyphs.",
        )
        validate_glb(showcase_path)

        make_contact_sheet(renders, PREVIEWS_DIR / "innerflect-v2-contact-sheet.png")
        if REFERENCE_IMAGE.exists():
            shutil.copy2(REFERENCE_IMAGE, PREVIEWS_DIR / "concept-reference.png")

    manifest = {
        "name": "InnerFlect Mirror V2 Operational Glyph System",
        "version": "2.1.0",
        "generator": "tools/glyph-kit/generate_innerflect_v2.py",
        "originalGeometry": True,
        "thirdPartyModels": False,
        "coordinateSystem": "Y-up",
        "unit": "metre",
        "palette": {
            "canvas": "#0A0A0A",
            "surface": "#161616",
            "text": "#F5F5F3",
            "secondary": "#8A8A85",
            "autonomy": "#4F9E94",
            "active": "#8AD8CC",
            "attention": "#E0A100",
            "danger": "#D6342A",
        },
        "states": {
            "human": "neutral grey",
            "supervised": "grey-to-teal transition with a decision gate",
            "autonomous": "continuous teal flow",
            "attention": "amber hotspot",
            "unsafe": "red, intentionally absent from normal V2 assets",
        },
        "materialNames": sorted({n for slug in ASSET_BUILDERS for n in stats[slug]["materialNames"]}),
        "assets": [
            {
                "id": slug,
                "label": ASSET_INFO[slug][0],
                "semantic": ASSET_INFO[slug][1],
                **stats[slug],
            }
            for slug in ASSET_BUILDERS
        ],
        **({"showcase": stats["innerflect-v2-showcase"]} if "innerflect-v2-showcase" in stats else {}),
    }
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "ok", "assets": len(assets), "models": len(list(MODELS_DIR.glob('*.glb'))), "manifest": str(ROOT / 'manifest.json')}, indent=2))


if __name__ == "__main__":
    import sys
    # Previews need matplotlib and Pillow and render Linux-only fonts; the live
    # /design/elements route is the real contact sheet now, so they are opt-in.
    main(previews="--preview" in sys.argv)
