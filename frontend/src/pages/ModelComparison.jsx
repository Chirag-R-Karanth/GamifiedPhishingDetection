import React, { useState, useEffect } from 'react';
import { mlAPI } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Activity, ShieldAlert, Cpu, Database, Play, RefreshCw, CheckCircle, Clock } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ModelComparison = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await mlAPI.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRetrain = async () => {
    if (retraining) return;
    try {
      setRetraining(true);
      setRetrainSuccess(false);
      await mlAPI.retrain();
      setRetrainSuccess(true);
      // Refresh metrics after a slight delay to allow background thread to start
      setTimeout(() => {
        fetchMetrics();
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return (
      <div className="cyber-glass p-8 text-center text-xs text-cyber-muted rounded">
        Fetching classifier benchmarking logs...
      </div>
    );
  }

  const modelNames = Object.keys(metrics || {});
  
  // 1. Chart Data: Core Scores (Accuracy, F1)
  const scoresData = {
    labels: modelNames,
    datasets: [
      {
        label: 'Accuracy Rate',
        data: modelNames.map(name => metrics[name].accuracy),
        backgroundColor: 'rgba(0, 255, 102, 0.4)',
        borderColor: '#00ff66',
        borderWidth: 1.5
      },
      {
        label: 'F1 Score',
        data: modelNames.map(name => metrics[name].f1),
        backgroundColor: 'rgba(59, 130, 246, 0.4)',
        borderColor: '#3b82f6',
        borderWidth: 1.5
      }
    ]
  };

  // 2. Chart Data: Latency (milliseconds per inference)
  const latencyData = {
    labels: modelNames,
    datasets: [
      {
        label: 'Latency (ms per sample)',
        data: modelNames.map(name => metrics[name].latency),
        backgroundColor: 'rgba(217, 70, 239, 0.4)',
        borderColor: '#d946ef',
        borderWidth: 1.5
      }
    ]
  };

  // 3. Chart Data: Memory usage (MB)
  const memoryData = {
    labels: modelNames,
    datasets: [
      {
        label: 'RAM Footprint (MB)',
        data: modelNames.map(name => metrics[name].memory),
        backgroundColor: 'rgba(0, 229, 255, 0.4)',
        borderColor: '#00e5ff',
        borderWidth: 1.5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#f3f4f6',
          font: { family: 'Courier New', size: 10 }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af', font: { family: 'Courier New', size: 9 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af', font: { family: 'Courier New', size: 9 } }
      }
    }
  };

  return (
    <div className="space-y-8">
      
      {/* HUD Header */}
      <div className="cyber-glass p-6 rounded-lg border border-cyber-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-xl font-black text-cyber-text tracking-widest uppercase flex items-center">
            <Cpu className="h-6 w-6 text-cyber-green mr-2" />
            AI MODEL BENCHMARKING LOGS
          </h1>
          <p className="text-xs text-cyber-muted mt-1 font-mono">
            COMPARING HEURISTIC, VECTOR GRADIENT, TREE BOOST, AND ATTENTION EMBEDDINGS
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {retrainSuccess && (
            <div className="flex items-center text-xs text-cyber-green font-bold bg-cyber-green/5 border border-cyber-green/30 px-3 py-1.5 rounded">
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Retraining Scheduled!
            </div>
          )}
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="text-xs bg-cyber-green text-cyber-dark font-black tracking-widest px-4 py-2.5 rounded hover:bg-cyber-green/90 transition shadow-neon-green flex items-center disabled:opacity-50"
          >
            {retraining ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                TRIGGERING RUN...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2 fill-current" />
                RETRAIN PIPELINE
              </>
            )}
          </button>
        </div>
      </div>

      {/* Model Parameters HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-glass p-5 rounded-lg border border-cyber-border space-y-2">
          <div className="flex items-center text-cyber-green font-bold text-xs uppercase tracking-wider">
            <Activity className="h-4 w-4 mr-1.5" />
            Accuracy & F1 Benchmark
          </div>
          <p className="text-[11px] text-cyber-muted leading-relaxed font-mono">
            Displays model classification hits. Tree Boost (XGBoost) and Transformer configurations score near-perfect bounds due to engineered heuristics, outperforming basic Naive Bayes.
          </p>
        </div>
        <div className="cyber-glass p-5 rounded-lg border border-cyber-border space-y-2">
          <div className="flex items-center text-cyber-purple font-bold text-xs uppercase tracking-wider">
            <Clock className="h-4 w-4 mr-1.5" />
            Execution Latency
          </div>
          <p className="text-[11px] text-cyber-muted leading-relaxed font-mono">
            Inference latency measured in milliseconds. DistilBERT processes sequence tokens heavily on CPUs (taking 25-45ms), whereas Logistic Regression finishes in micro-intervals (&lt;0.1ms).
          </p>
        </div>
        <div className="cyber-glass p-5 rounded-lg border border-cyber-border space-y-2">
          <div className="flex items-center text-cyber-blue font-bold text-xs uppercase tracking-wider">
            <Database className="h-4 w-4 mr-1.5" />
            Memory Footprint
          </div>
          <p className="text-[11px] text-cyber-muted leading-relaxed font-mono">
            Active RAM allocation footprints. Transformers require heavy embeddings loading in memory (260MB+). Scikit-learn vectors require almost zero background allocations (&lt;1MB).
          </p>
        </div>
      </div>

      {/* Visual Graphs Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Scores Graph */}
        <div className="cyber-glass p-6 rounded-lg border border-cyber-border">
          <h3 className="text-xs font-black text-cyber-text uppercase tracking-widest mb-4 border-b border-cyber-border pb-2">
            MODEL PREDICTION RATES
          </h3>
          <div className="h-[280px]">
            <Bar data={scoresData} options={chartOptions} />
          </div>
        </div>

        {/* Latency Graph */}
        <div className="cyber-glass p-6 rounded-lg border border-cyber-border">
          <h3 className="text-xs font-black text-cyber-text uppercase tracking-widest mb-4 border-b border-cyber-border pb-2">
            INFERENCE LATENCY OVERHEAD (MS)
          </h3>
          <div className="h-[280px]">
            <Bar data={latencyData} options={chartOptions} />
          </div>
        </div>

        {/* Memory allocation Graph */}
        <div className="cyber-glass p-6 rounded-lg border border-cyber-border lg:col-span-2">
          <h3 className="text-xs font-black text-cyber-text uppercase tracking-widest mb-4 border-b border-cyber-border pb-2">
            MODEL SYSTEM MEMORY FOOTPRINT (MB)
          </h3>
          <div className="h-[280px]">
            <Bar data={memoryData} options={chartOptions} />
          </div>
        </div>

      </div>

    </div>
  );
};

export default ModelComparison;
