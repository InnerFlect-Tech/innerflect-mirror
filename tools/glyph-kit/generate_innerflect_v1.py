#!/usr/bin/env python3
"""Generate the InnerFlect Mirror V1 procedural 3D glyph kit.

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
MODELS_DIR = REPO / "public" / "models" / "innerflect-v1"
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
    "function-platform": (
        "FUNCTION PLATFORM",
        "A coherent operational area such as Sales, Finance, or Support.",
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
    "knowledge-slab": (
        "KNOWLEDGE SLAB",
        "A document, policy, rule, instruction, or company memory.",
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
        "Uncertainty, friction, policy conflict, or an unsafe condition.",
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
    faces = orient_convex_faces(vertices, np.asarray(hull.simplices, dtype=np.int32))
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
    parts = [
        make_part("Core_Base", chamfered_box((3.3, 0.22, 3.3), 0.09), "graphite", (0, 0.11, 0)),
        make_part("Mirror_Foundation", chamfered_box((2.9, 0.38, 2.9), 0.10), "teal_glass", (0, 0.41, 0)),
        make_part("Mirror_Volume", chamfered_box((2.35, 1.02, 2.35), 0.12), "teal_glass", (0, 1.05, 0)),
        make_part("Mirror_Seam", chamfered_box((2.52, 0.065, 2.52), 0.025), "teal_bright", (0, 1.59, 0)),
        make_part("Company_Volume", chamfered_box((2.35, 1.16, 2.35), 0.12), "glass", (0, 2.20, 0)),
        make_part("Company_State", chamfered_box((1.46, 1.32, 1.46), 0.10), "graphite_light", (0, 2.10, 0)),
        make_part("State_Light", low_sphere(0.12, 4, 8), "teal_bright", (0, 1.60, -0.78)),
    ]
    for index, (x, z) in enumerate(((-0.94, -0.94), (0.94, -0.94), (-0.94, 0.94), (0.94, 0.94))):
        parts.append(make_part(f"Company_Frame_{index+1}", chamfered_box((0.12, 1.02, 0.12), 0.025), "glass", (x, 2.20, z)))
    return parts


def function_platform() -> list[Part]:
    parts = [
        make_part("Zone_Base", chamfered_box((3.35, 0.22, 3.0), 0.09), "graphite", (0, 0.11, 0)),
        make_part("Zone_Field", chamfered_box((3.12, 0.18, 2.77), 0.07), "teal_glass", (0, 0.30, 0)),
    ]
    stations = ((-0.90, -0.42, 0.88), (0.0, 0.35, 1.10), (0.90, -0.42, 0.88))
    for index, (x, z, height) in enumerate(stations):
        parts.extend([
            make_part(f"Station_{index+1}_Desk", chamfered_box((0.70, 0.12, 0.52), 0.035), "graphite_light", (x, 0.60, z)),
            make_part(f"Station_{index+1}_Leg", chamfered_box((0.10, 0.46, 0.10), 0.025), "neutral", (x, 0.39, z)),
            make_part(f"Station_{index+1}_Screen", chamfered_box((0.42, height * 0.55, 0.07), 0.025), "glass", (x, 0.91, z - 0.19), rotation=(-8, 0, 0)),
            make_part(f"Station_{index+1}_Signal", chamfered_box((0.25, 0.035, 0.02), 0.008), "teal_bright", (x, 0.91, z - 0.235), rotation=(-8, 0, 0)),
        ])
    points = [(-1.05, 0.39, 0.0), (0, 0.43, 0.20), (1.05, 0.39, 0.0)]
    parts.append(make_part("Zone_Internal_Flow", tube(points, 0.025, 6), "teal"))
    return parts


def human_glyph() -> list[Part]:
    parts = [
        make_part("Human_Torso", chamfered_box((0.64, 0.92, 0.40), 0.10), "neutral", (0, 1.43, 0)),
        make_part("Human_Head", low_sphere(0.31, 4, 8), "white", (0, 2.22, 0)),
        make_part("Human_Leg_Left", chamfered_box((0.23, 0.86, 0.25), 0.055), "neutral", (-0.19, 0.52, 0)),
        make_part("Human_Leg_Right", chamfered_box((0.23, 0.86, 0.25), 0.055), "neutral", (0.19, 0.52, 0)),
        make_part("Human_Arm_Left", chamfered_box((0.19, 0.83, 0.22), 0.045), "neutral", (-0.43, 1.41, 0), rotation=(0, 0, -5)),
        make_part("Human_Arm_Right", chamfered_box((0.19, 0.83, 0.22), 0.045), "neutral", (0.43, 1.41, 0), rotation=(0, 0, 5)),
        make_part("Human_Authority_Marker", low_sphere(0.075, 4, 8), "teal_bright", (0, 1.45, -0.25)),
    ]
    return parts


def agent_glyph() -> list[Part]:
    parts = [
        make_part("Agent_Core", octahedron(0.47), "teal_bright", (0, 1.25, 0)),
        make_part("Agent_Orbit_A", torus(0.82, 0.035, 32, 6), "teal", (0, 1.25, 0), rotation=(90, 0, 0)),
        make_part("Agent_Orbit_B", torus(0.67, 0.025, 28, 6), "glass", (0, 1.25, 0), rotation=(0, 0, 90)),
        make_part("Agent_Frame_Left", chamfered_box((0.13, 1.72, 0.13), 0.035), "graphite_light", (-0.98, 1.12, 0)),
        make_part("Agent_Frame_Right", chamfered_box((0.13, 1.72, 0.13), 0.035), "graphite_light", (0.98, 1.12, 0)),
        make_part("Agent_Frame_Top", chamfered_box((2.08, 0.13, 0.13), 0.035), "graphite_light", (0, 1.98, 0)),
    ]
    for index, position in enumerate(((-0.74, 1.66, 0), (0.74, 0.84, 0), (0.06, 1.25, 0.68))):
        parts.append(make_part(f"Agent_Node_{index+1}", low_sphere(0.10, 4, 8), "teal_bright", position))
    return parts


def tool_glyph() -> list[Part]:
    parts = [
        make_part("Tool_System", chamfered_box((1.15, 1.74, 0.92), 0.12), "graphite_light", (-0.28, 1.00, 0.18)),
        make_part("Tool_Console", chamfered_box((1.02, 0.70, 0.44), 0.08), "graphite", (0.43, 0.53, -0.42)),
        make_part("Tool_Screen", chamfered_box((0.82, 0.63, 0.08), 0.045), "glass", (0.35, 1.13, -0.52), rotation=(-12, 0, 0)),
        make_part("Tool_Line_A", chamfered_box((0.53, 0.045, 0.022), 0.012), "teal_bright", (0.35, 1.23, -0.585), rotation=(-12, 0, 0)),
        make_part("Tool_Line_B", chamfered_box((0.38, 0.045, 0.022), 0.012), "teal", (0.28, 1.06, -0.622), rotation=(-12, 0, 0)),
        make_part("Tool_Status", low_sphere(0.10, 5, 10), "teal_bright", (0.47, 0.53, -0.69)),
    ]
    return parts


def knowledge_slab() -> list[Part]:
    group = [
        make_part("Knowledge_Back", chamfered_box((1.58, 2.02, 0.14), 0.09), "teal_glass", (0, 1.10, 0)),
        make_part("Knowledge_Surface", chamfered_box((1.40, 1.82, 0.09), 0.07), "glass", (0, 1.10, -0.09)),
        make_part("Knowledge_Mark", chamfered_box((0.28, 0.28, 0.035), 0.035), "teal_bright", (-0.43, 1.57, -0.155)),
    ]
    widths = (0.70, 0.88, 0.72, 0.82)
    for index, width in enumerate(widths):
        group.append(make_part(
            f"Knowledge_Line_{index+1}",
            chamfered_box((width, 0.035, 0.025), 0.008),
            "white" if index == 0 else "neutral",
            (0.18 - (0.88 - width) / 2, 1.38 - index * 0.25, -0.16),
        ))
    matrix = rotation_matrix((-8, 0, -10))
    return [Part(part.name, part.vertices @ matrix.T, part.faces, part.material) for part in group]


def workflow_line() -> list[Part]:
    path = np.array([
        [-1.45, 0.28, 0.50], [-1.02, 0.31, 0.40], [-0.62, 0.43, 0.28],
        [-0.22, 0.68, 0.13], [0.25, 0.76, 0.04], [0.72, 1.06, -0.15],
        [1.25, 1.30, -0.36],
    ])
    parts = [
        make_part("Workflow_Human", tube(path[:4], 0.055, 8), "neutral"),
        make_part("Workflow_Autonomous", tube(path[3:], 0.058, 8), "teal_bright"),
    ]
    for index in (0, 3, 5):
        parts.append(make_part(
            f"Workflow_Node_{index}", low_sphere(0.105, 5, 10),
            "neutral" if index == 0 else "teal_bright", tuple(path[index]),
        ))
    direction = unit(path[-1] - path[-2])
    parts.append(make_part(
        "Workflow_Direction", frustum(0.42, 0.18, 0.0, 10), "teal_bright",
        tuple(path[-1] + direction * 0.14), matrix=align_y_to(direction),
    ))
    return parts


def decision_gate() -> list[Part]:
    return [
        make_part("Gate_Frame", torus(0.79, 0.115, 36, 8), "graphite_light", (0, 1.13, 0), rotation=(90, 0, 0)),
        make_part("Gate_Authority", torus(0.65, 0.038, 36, 6), "amber", (0, 1.13, -0.02), rotation=(90, 0, 0)),
        make_part("Gate_Pillar_Left", chamfered_box((0.23, 1.52, 0.28), 0.055), "graphite_light", (-0.91, 0.77, 0)),
        make_part("Gate_Pillar_Right", chamfered_box((0.23, 1.52, 0.28), 0.055), "graphite_light", (0.91, 0.77, 0)),
        make_part("Gate_Input", tube([(-1.42, 0.74, 0), (-0.66, 0.74, 0)], 0.032, 6), "neutral"),
        make_part("Gate_Output", tube([(0.66, 0.74, 0), (1.42, 0.74, 0)], 0.032, 6), "amber"),
        make_part("Gate_Decision", low_sphere(0.095, 5, 10), "amber", (0, 0.74, -0.03)),
    ]


def action_pulse() -> list[Part]:
    path = np.array([[-1.38, 0.32, 0.48], [-0.48, 0.68, 0.18], [0.42, 1.00, -0.14], [1.36, 1.35, -0.46]])
    pulse_position = 0.44 * path[1] + 0.56 * path[2]
    return [
        make_part("Action_Rail", tube(path, 0.035, 7), "teal"),
        make_part("Action_Pulse", low_sphere(0.27, 7, 12), "teal_bright", tuple(pulse_position)),
        make_part("Action_Origin", low_sphere(0.09, 5, 10), "teal", tuple(path[0])),
        make_part("Action_Target", low_sphere(0.11, 5, 10), "white", tuple(path[-1])),
        make_part("Action_Trail", tube([path[1], pulse_position], 0.075, 8), "teal_glass"),
    ]


def risk_hotspot() -> list[Part]:
    return [
        make_part("Risk_Context_Base", chamfered_box((2.50, 0.20, 2.20), 0.08), "graphite", (0, 0.10, 0)),
        make_part("Risk_Context_Layer", chamfered_box((1.90, 0.54, 1.62), 0.09), "glass", (0, 0.46, 0)),
        make_part("Risk_Condition", chamfered_box((0.64, 0.64, 0.64), 0.08), "amber", (0, 0.94, 0)),
        make_part("Risk_Field_A", torus(0.86, 0.025, 36, 6), "amber_glass", (0, 1.08, 0)),
        make_part("Risk_Field_B", torus(1.10, 0.018, 40, 6), "amber", (0, 1.36, 0)),
        make_part("Risk_Axis", frustum(1.15, 0.023, 0.023, 8), "amber_glass", (0, 1.70, 0)),
        make_part("Risk_Centre", low_sphere(0.11, 5, 10), "amber", (0, 0.94, -0.36)),
    ]


ASSET_BUILDERS: dict[str, Callable[[], list[Part]]] = {
    "company-core": company_core,
    "function-platform": function_platform,
    "human-glyph": human_glyph,
    "agent-glyph": agent_glyph,
    "tool-glyph": tool_glyph,
    "knowledge-slab": knowledge_slab,
    "workflow-line": workflow_line,
    "decision-gate": decision_gate,
    "action-pulse": action_pulse,
    "risk-hotspot": risk_hotspot,
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
            "system": "InnerFlect Mirror V1",
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
        "file": f"models/{output.name}",
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

    width, height = 3200, 1800
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
    draw.text((82, 92), "V1 · OPERATIONAL GLYPH SYSTEM", font=title_font, fill=(245, 245, 243, 255))
    draw.text((82, 163), "Ten original procedural assets · Human and Agent are intentionally distinct", font=body_font, fill=(138, 138, 133, 240))
    draw.line((82, 216, width - 82, 216), fill=(79, 158, 148, 95), width=2)

    margin_x = 66
    top = 250
    gap_x = 20
    gap_y = 22
    cell_width = (width - 2 * margin_x - 4 * gap_x) // 5
    cell_height = (height - top - 58 - gap_y) // 2
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
    z_positions = (2.8, -3.0)
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

    showcase = build_showcase(assets)
    showcase_path = MODELS_DIR / "innerflect-v1-showcase.glb"
    stats["innerflect-v1-showcase"] = write_glb(
        showcase,
        showcase_path,
        "INNERFLECT MIRROR V1 SHOWCASE",
        "A display scene containing all ten V1 operational glyphs.",
    )
    validate_glb(showcase_path)

    if previews:
        make_contact_sheet(renders, PREVIEWS_DIR / "innerflect-v1-contact-sheet.png")
    if REFERENCE_IMAGE.exists():
        shutil.copy2(REFERENCE_IMAGE, PREVIEWS_DIR / "concept-reference.png")

    manifest = {
        "name": "InnerFlect Mirror V1 Operational Glyph System",
        "version": "1.0.0",
        "generator": "source/generate_innerflect_v1.py",
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
            "unsafe": "red, intentionally absent from normal V1 assets",
        },
        "assets": [
            {
                "id": slug,
                "label": ASSET_INFO[slug][0],
                "semantic": ASSET_INFO[slug][1],
                **stats[slug],
            }
            for slug in ASSET_BUILDERS
        ],
        "showcase": stats["innerflect-v1-showcase"],
    }
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "ok", "assets": len(assets), "models": len(list(MODELS_DIR.glob('*.glb'))), "manifest": str(ROOT / 'manifest.json')}, indent=2))


if __name__ == "__main__":
    import sys
    # Previews need matplotlib and Pillow and render Linux-only fonts; the live
    # /design/elements route is the real contact sheet now, so they are opt-in.
    main(previews="--preview" in sys.argv)
