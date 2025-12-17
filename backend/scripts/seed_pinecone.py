"""
Seed Pinecone with Manim code examples for RAG retrieval.
Run: python -m scripts.seed_pinecone
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from dotenv import load_dotenv
load_dotenv()

from app.services.pinecone_service import upsert_example

MANIM_EXAMPLES = [
    {
        "id": "circle_to_square",
        "description": "Transform a circle into a square with smooth animation",
        "code": '''from manim import *

class CircleToSquare(Scene):
    def construct(self):
        circle = Circle(color=BLUE, fill_opacity=0.5)
        square = Square(color=RED, fill_opacity=0.5)
        
        self.play(Create(circle))
        self.wait(0.5)
        self.play(Transform(circle, square))
        self.wait()'''
    },
    {
        "id": "rotating_shapes",
        "description": "Multiple shapes rotating around a center point",
        "code": '''from manim import *

class RotatingShapes(Scene):
    def construct(self):
        shapes = VGroup(
            Circle(color=RED),
            Square(color=BLUE),
            Triangle(color=GREEN)
        ).arrange(RIGHT, buff=1)
        
        self.play(Create(shapes))
        self.play(Rotate(shapes, angle=2*PI, about_point=ORIGIN), run_time=3)
        self.wait()'''
    },
    {
        "id": "text_animation",
        "description": "Animated text appearing with typewriter effect",
        "code": '''from manim import *

class TextAnimation(Scene):
    def construct(self):
        title = Text("Hello, Manim!", font_size=72)
        subtitle = Text("Beautiful Math Animations", font_size=36, color=BLUE)
        subtitle.next_to(title, DOWN)
        
        self.play(Write(title), run_time=2)
        self.play(FadeIn(subtitle, shift=UP))
        self.wait()'''
    },
    {
        "id": "graph_plotting",
        "description": "Plot a mathematical function graph with axes",
        "code": '''from manim import *

class GraphPlotting(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-2, 2, 1],
            axis_config={"color": BLUE}
        )
        
        graph = axes.plot(lambda x: np.sin(x), color=YELLOW)
        label = axes.get_graph_label(graph, label="\\sin(x)")
        
        self.play(Create(axes))
        self.play(Create(graph), Write(label))
        self.wait()'''
    },
    {
        "id": "morphing_numbers",
        "description": "Numbers counting up with animation",
        "code": '''from manim import *

class MorphingNumbers(Scene):
    def construct(self):
        number = DecimalNumber(0, num_decimal_places=0, font_size=96)
        
        self.add(number)
        self.play(
            ChangeDecimalToValue(number, 100),
            run_time=3,
            rate_func=linear
        )
        self.wait()'''
    },
    {
        "id": "3d_surface",
        "description": "3D surface plot rotating in space",
        "code": '''from manim import *

class Surface3D(ThreeDScene):
    def construct(self):
        axes = ThreeDAxes()
        surface = Surface(
            lambda u, v: axes.c2p(u, v, np.sin(u) * np.cos(v)),
            u_range=[-PI, PI],
            v_range=[-PI, PI],
            resolution=(30, 30)
        )
        surface.set_style(fill_opacity=0.7)
        
        self.set_camera_orientation(phi=75*DEGREES, theta=30*DEGREES)
        self.play(Create(axes), Create(surface))
        self.begin_ambient_camera_rotation(rate=0.2)
        self.wait(5)'''
    },
    {
        "id": "vector_field",
        "description": "Animated vector field visualization",
        "code": '''from manim import *

class VectorFieldScene(Scene):
    def construct(self):
        func = lambda pos: np.sin(pos[0]) * UR + np.cos(pos[1]) * LEFT
        vector_field = ArrowVectorField(func)
        
        self.play(Create(vector_field))
        self.wait()
        
        stream_lines = StreamLines(func, stroke_width=2, max_anchors_per_line=30)
        self.play(FadeOut(vector_field))
        self.add(stream_lines)
        stream_lines.start_animation(warm_up=True, flow_speed=1.5)
        self.wait(3)'''
    },
    {
        "id": "pythagorean_theorem",
        "description": "Visual proof of Pythagorean theorem",
        "code": '''from manim import *

class PythagoreanTheorem(Scene):
    def construct(self):
        triangle = Polygon(ORIGIN, RIGHT*3, RIGHT*3 + UP*4, color=WHITE)
        a_label = MathTex("a=3").next_to(triangle, DOWN)
        b_label = MathTex("b=4").next_to(triangle, RIGHT)
        c_label = MathTex("c=5").move_to(triangle.get_center() + UL*0.5)
        
        self.play(Create(triangle))
        self.play(Write(a_label), Write(b_label), Write(c_label))
        
        equation = MathTex("a^2 + b^2 = c^2").to_edge(UP)
        result = MathTex("9 + 16 = 25").next_to(equation, DOWN)
        
        self.play(Write(equation))
        self.play(Write(result))
        self.wait()'''
    },
    {
        "id": "color_gradient",
        "description": "Shape with animated color gradient",
        "code": '''from manim import *

class ColorGradient(Scene):
    def construct(self):
        circle = Circle(radius=2, fill_opacity=1)
        colors = [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE]
        
        circle.set_color(color=colors)
        self.play(Create(circle))
        
        for _ in range(3):
            colors = colors[1:] + [colors[0]]
            self.play(circle.animate.set_color(colors), run_time=0.5)
        self.wait()'''
    },
    {
        "id": "fractal_tree",
        "description": "Recursive fractal tree animation",
        "code": '''from manim import *

class FractalTree(Scene):
    def construct(self):
        def create_branch(start, angle, length, depth):
            if depth == 0 or length < 0.1:
                return VGroup()
            
            end = start + length * np.array([np.sin(angle), np.cos(angle), 0])
            line = Line(start, end, color=interpolate_color(BROWN, GREEN, depth/6))
            
            left = create_branch(end, angle - PI/6, length * 0.7, depth - 1)
            right = create_branch(end, angle + PI/6, length * 0.7, depth - 1)
            
            return VGroup(line, left, right)
        
        tree = create_branch(DOWN * 3, 0, 2, 6)
        self.play(Create(tree), run_time=4)
        self.wait()'''
    }
]

async def seed():
    print("Seeding Pinecone with Manim examples...")
    
    for example in MANIM_EXAMPLES:
        print(f"  Uploading: {example['id']}")
        await upsert_example(
            id=example["id"],
            description=example["description"],
            code=example["code"]
        )
    
    print(f"Done! Uploaded {len(MANIM_EXAMPLES)} examples.")

if __name__ == "__main__":
    asyncio.run(seed())

