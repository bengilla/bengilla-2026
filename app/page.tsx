import { getAllProjects } from '@/lib/db';
import HeroSlider from '@/components/HeroSlider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const projects = await getAllProjects();

  return (
    <>
      <Header projects={projects} />
      <main>
        <section className="hero">
          {/* 手机端浮动 Logo */}
          <a href="/" className="mobile-logo">BENGILLA</a>

          <div className="hero-content">
            <div className="hero-works">
              <div className="hero-slider">
                <HeroSlider projects={projects} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
