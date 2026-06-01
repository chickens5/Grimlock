import React from 'react';
import SoftAurora from '../components/SoftAurora.jsx';
import './MLPage.css';

const MODULES = [
	{
		title: 'Hydroponic Advisor',
		description: 'Analyze recent environment snapshots and highlight pH, EC, RH, and VPD drift risks.'
	},
	{
		title: 'Plant Diagnosis',
		description: 'Generate rule-based diagnosis from symptom logs and labeled media observations.'
	},
	{
		title: 'Native Plant ML',
		description: 'Planned model tools for ranking and predicting outcomes from native plant dataset features.'
	}
];

export default function MLPage({ onNavigateTo }) {
	return (
		<div className="ml-page">
			<SoftAurora
				speed={0.45}
				scale={1.35}
				brightness={0.9}
				color1="#d7f0dc"
				color2="#83b8aa"
				noiseFrequency={2}
				noiseAmplitude={0.85}
				bandHeight={0.55}
				bandSpread={0.9}
				octaveDecay={0.2}
				layerOffset={0.05}
				colorSpeed={0.7}
				enableMouseInteraction
				mouseInfluence={0.2}
			/>

			<div className="ml-page-content">
				<header className="ml-page-header">
					<button className="ml-page-btn" onClick={() => onNavigateTo('home')}>
						Home
					</button>
				</header>

				<section className="ml-page-hero">
					<h1>ML Workspace</h1>
					<p>
						Local-first machine learning workspace for hydroponic guidance, plant diagnosis,
						and future native-plant intelligence modules.
					</p>
				</section>

				<section className="ml-module-grid">
					{MODULES.map((module) => (
						<article key={module.title} className="ml-module-card">
							<h2>{module.title}</h2>
							<p>{module.description}</p>
						</article>
					))}
				</section>
			</div>
		</div>
	);
}

