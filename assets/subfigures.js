window.SUBFIGURES = [
  {
    "id": "https://openalex.org/W2626778328",
    "title": "Attention Is All You Need",
    "year": 2017,
    "authors": [
      "Ashish Vaswani",
      "Noam Shazeer",
      "Niki Parmar",
      "Jakob Uszkoreit",
      "Llion Jones",
      "Aidan N. Gomez",
      "Łukasz Kaiser",
      "Illia Polosukhin"
    ],
    "venue": "neural information processing systems",
    "url": "https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html",
    "pdf": "",
    "arxivId": "1706.03762",
    "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing both with large and limited training data.",
    "figures": [
      {
        "id": "1706.03762v7-fig1",
        "figureNumber": 1,
        "caption": "The Transformer - model architecture.",
        "image": "/api/paper-assets/1706.03762v7/Figures/ModalNet-21.png"
      },
      {
        "id": "1706.03762v7-fig2",
        "figureNumber": 2,
        "caption": "(left) Scaled Dot-Product Attention. (right) Multi-Head Attention consists of several attention layers running in parallel.",
        "image": "/api/paper-assets/1706.03762v7/Figures/ModalNet-19.png"
      }
    ]
  },
  {
    "id": "https://openalex.org/W3135367836",
    "title": "Learning Transferable Visual Models From Natural Language Supervision",
    "year": 2021,
    "authors": [
      "Alec Radford",
      "Jong Wook Kim",
      "Chris Hallacy",
      "Ramesh, Aditya",
      "Gabriel Goh",
      "Sandhini Agarwal",
      "Girish Sastry",
      "Amanda Askell",
      "Pamela Mishkin",
      "Jack Clark",
      "Gretchen Marie Krueger",
      "Ilya Sutskever"
    ],
    "venue": "International Conference on Machine Learning",
    "url": "https://proceedings.mlr.press/v139/radford21a.html",
    "pdf": "http://proceedings.mlr.press/v139/radford21a/radford21a.pdf",
    "arxivId": "2103.00020",
    "abstract": "State-of-the-art computer vision systems are trained to predict a fixed set of predetermined object categories. This restricted form of supervision limits their generality and usability since additional labeled data is needed to specify any other visual concept. Learning directly from raw text about images is a promising alternative which leverages a much broader source of supervision. We demonstrate that the simple pre-training task of predicting which caption goes with which image is an efficient and scalable way to learn SOTA image representations from scratch on a dataset of 400 million (image, text) pairs collected from the internet. After pre-training, natural language is used to reference learned visual concepts (or describe new ones) enabling zero-shot transfer of the model to downstream tasks. We study the performance of this approach by benchmarking on over 30 different existing computer vision datasets, spanning tasks such as OCR, action recognition in videos, geo-localization, and many types of fine-grained object classification. The model transfers non-trivially to most tasks and is often competitive with a fully supervised baseline without the need for any dataset specific training. For instance, we match the accuracy of the original ResNet-50 on ImageNet zero-shot without needing to use any of the 1.28 million training examples it was trained on. We release our code and pre-trained model weights at https://github.com/OpenAI/CLIP.",
    "figures": [
      {
        "id": "2103.00020v1-fig1",
        "figureNumber": 1,
        "caption": "Summary of our approach. While standard image models jointly train an image feature extractor and a linear classifier to predict some label, CLIP jointly trains an image encoder and a text encoder to predict the correct pairings of a batch of (image, text) training examples. At test time the learned text encoder synthesizes a zero-shot linear classifier by embedding the names or descriptions of the target dataset’s classes.",
        "image": "/api/paper-assets/2103.00020v1/main-diagrams.png"
      },
      {
        "id": "2103.00020v1-fig13",
        "figureNumber": 13,
        "caption": "Zero-shot CLIP is much more robust to distribution shift than standard ImageNet models. (Left) An ideal robust model (dashed line) performs equally well on the ImageNet distribution and on other natural image distributions. Zero-shot CLIP models shrink this “robustness gap” by up to 75%. Linear fits on logit transformed values are shown with bootstrap estimated 95% confidence intervals. (Right) Visualizing distribution shift for bananas, a class shared across 5 of the 7 natural distribution shift datasets. The performance of the best zero-shot CLIP model, ViT-L/14@336px, is compared with a model that has the same performance on the ImageNet validation set, ResNet-101.",
        "image": "/api/paper-assets/2103.00020v1/zs-clip-vs-imagenet-robustness-datasets.png"
      },
      {
        "id": "2103.00020v1-fig14",
        "figureNumber": 14,
        "caption": "While supervised adaptation to ImageNet increases ImageNet accuracy by 9.2%, it slightly reduces average robustness. (Left) Customizing zero-shot CLIP to each dataset improves robustness compared to using a single static zero-shot ImageNet classifier and pooling predictions across similar classes as in Taori et al. (2020). CLIP models adapted to ImageNet have similar effective robustness as the best prior ImageNet models. (Right) Details of per dataset changes in accuracy for the two robustness interventions. Adapting to ImageNet increases accuracy on ImageNetV2 noticeably but trades off accuracy on several other distributions. Dataset specific zero-shot classifiers can improve accuracy by a large amount but are limited to only a few datasets that include classes which don’t perfectly align with ImageNet categories.",
        "image": "/api/paper-assets/2103.00020v1/robustness-interventions.png"
      },
      {
        "id": "2103.00020v1-fig15",
        "figureNumber": 15,
        "caption": "Few-shot CLIP also increases effective robustness compared to existing ImageNet models but is less robust than zero-shot CLIP. Minimizing the amount of ImageNet training data used for adaption increases effective robustness at the cost of decreasing relative robustness. 16-shot logistic regression CLIP matches zero-shot CLIP on ImageNet, as previously reported in Figure 7, but is less robust.",
        "image": "/api/paper-assets/2103.00020v1/fs-clip-vs-imagenet-robustness-plot.png"
      },
      {
        "id": "2103.00020v1-fig19",
        "figureNumber": 19,
        "caption": "Two example images from the Rendered SST2 dataset",
        "image": "/api/paper-assets/2103.00020v1/sst2-positive.png"
      },
      {
        "id": "2103.00020v1-fig21",
        "figureNumber": 21,
        "caption": "Visualization of predictions from 36 CLIP zero-shot classifiers. All examples are random with the exception of reselecting Hateful Memes to avoid offensive content. The predicted probability of the top 5 classes is shown along with the text used to represent the class. When more than one template is used, the first template is shown. The ground truth label is colored green while an incorrect prediction is colored orange.",
        "image": "/api/paper-assets/2103.00020v1/final_zero_shot_prediction_vis.png"
      }
    ]
  },
  {
    "id": "https://openalex.org/W4390874575",
    "title": "Segment Anything",
    "year": 2023,
    "authors": [
      "Alexander Kirillov",
      "Eric Mintun",
      "Nikhila Ravi",
      "Hanzi Mao",
      "Chloe Rolland",
      "Laura Gustafson",
      "Tete Xiao",
      "Spencer Whitehead",
      "Alexander C. Berg",
      "Wan‐Yen Lo",
      "Piotr Dollár",
      "Ross Girshick"
    ],
    "venue": "IEEE/CVF International Conference on Computer Vision (ICCV)",
    "url": "https://doi.org/10.1109/iccv51070.2023.00371",
    "pdf": "",
    "arxivId": "2304.02643",
    "abstract": "We introduce the Segment Anything (SA) project: a new task, model, and dataset for image segmentation. Using our efficient model in a data collection loop, we built the largest segmentation dataset to date (by far), with over 1 billion masks on 11M licensed and privacy respecting images. The model is designed and trained to be promptable, so it can transfer zero-shot to new image distributions and tasks. We evaluate its capabilities on numerous tasks and find that its zero-shot performance is impressive – often competitive with or even superior to prior fully supervised results. We are releasing the Segment Anything Model (SAM) and corresponding dataset (SA-1B) of 1B masks and 11M images at segment-anything.com to foster research into foundation models for computer vision. We recommend reading the full paper at: arxiv.org/abs/2304.02643.",
    "figures": [
      {
        "id": "2304.02643v1-fig3",
        "figureNumber": 3,
        "caption": ": Each column shows 3 valid masks generated by SAM from a single ambiguous point prompt (green circle).",
        "image": "/api/paper-assets/2304.02643v1/ambiguity_examples.png"
      },
      {
        "id": "2304.02643v1-fig4",
        "figureNumber": 4,
        "caption": ": Segment Anything Model (SAM) overview. A heavyweight image encoder outputs an image embedding that can then be efficiently queried by a variety of input prompts to produce object masks at amortized real-time speed. For ambiguous prompts corresponding to more than one object, SAM can output multiple valid masks and associated confidence scores.",
        "image": "/api/paper-assets/2304.02643v1/model_diagram.png"
      },
      {
        "id": "2304.02643v1-fig5",
        "figureNumber": 5,
        "caption": ": Image-size normalized mask center distributions.",
        "image": "/api/paper-assets/2304.02643v1/figs/center_distribution.png"
      },
      {
        "id": "2304.02643v1-fig7",
        "figureNumber": 7,
        "caption": ": Estimated geographic distribution of SA-1B images. Most of the world’s countries have more than 1000 images in SA-1B, and the three countries with the most images are from different parts of the world.",
        "image": "/api/paper-assets/2304.02643v1/ablation_sa1b_geography.png"
      },
      {
        "id": "2304.02643v1-fig8",
        "figureNumber": 8,
        "caption": ": Samples from the 23 diverse segmentation datasets used to evaluate SAM’s zero-shot transfer capabilities.",
        "image": "/api/paper-assets/2304.02643v1/figs/datasets/ade20k_ADE_val_00001049.jpg"
      },
      {
        "id": "2304.02643v1-fig10",
        "figureNumber": 10,
        "caption": ": Zero-shot edge prediction on BSDS500. SAM was not trained to predict edge maps nor did it have access to BSDS images or annotations during training.",
        "image": "/api/paper-assets/2304.02643v1/35028.png"
      },
      {
        "id": "2304.02643v1-fig12",
        "figureNumber": 12,
        "caption": ": Zero-shot text-to-mask. SAM can work with simple and nuanced text prompts. When SAM fails to make a correct prediction, an additional point prompt can help.",
        "image": "/api/paper-assets/2304.02643v1/a_wheel.png"
      },
      {
        "id": "2304.02643v1-fig15",
        "figureNumber": 15,
        "caption": ": Additional visualizations of zero-shot edge predictions on BSDS500. Recall that SAM was not trained to predict edge maps and did not have access to BSDS images and annotations during training.",
        "image": "/api/paper-assets/2304.02643v1/201080.png"
      },
      {
        "id": "2304.02643v1-fig16",
        "figureNumber": 16,
        "caption": ": Zero-shot instance segmentation on LVIS v1. SAM produces higher quality masks than ViTDet. As a zero-shot model, SAM does not have the opportunity to learn specific training data biases; see top-right as an example where SAM makes a modal prediction, whereas the ground truth in LVIS is amodal given that mask annotations in LVIS have no holes.",
        "image": "/api/paper-assets/2304.02643v1/image_117016_ann_134079_maskuncropped.png"
      },
      {
        "id": "2304.02643v1-fig17",
        "figureNumber": 17,
        "caption": ": Visualization of thresholding the similarities of mask embeddings from SAM’s latent space. A query is indicated by the magenta box; top row shows matches at a low threshold, bottom row at a high threshold. The most similar mask embeddings in the same image can often be semantically similar to the query mask embedding, even though SAM is not trained with explicit semantic supervision.",
        "image": "/api/paper-assets/2304.02643v1/latent_visualization.png"
      }
    ]
  },
  {
    "id": "https://openalex.org/W4390873054",
    "title": "Adding Conditional Control to Text-to-Image Diffusion Models",
    "year": 2023,
    "authors": [
      "Lvmin Zhang",
      "Anyi Rao",
      "Maneesh Agrawala"
    ],
    "venue": "IEEE/CVF International Conference on Computer Vision (ICCV)",
    "url": "https://doi.org/10.1109/iccv51070.2023.00355",
    "pdf": "",
    "arxivId": "2302.05543",
    "abstract": "We present ControlNet, a neural network architecture to add spatial conditioning controls to large, pretrained text-to-image diffusion models. ControlNet locks the production-ready large diffusion models, and reuses their deep and robust encoding layers pretrained with billions of images as a strong backbone to learn a diverse set of conditional controls. The neural architecture is connected with \"zero convolutions\" (zero-initialized convolution layers) that progressively grow the parameters from zero and ensure that no harmful noise could affect the finetuning. We test various conditioning controls, e.g., edges, depth, segmentation, human pose, etc., with Stable Diffusion, using single or multiple conditions, with or without prompts. We show that the training of ControlNets is robust with small (1m) datasets. Extensive results show that ControlNet may facilitate wider applications to control image diffusion models.",
    "figures": [
      {
        "id": "2302.05543v3-fig2",
        "figureNumber": 2,
        "caption": "A neural block takes a feature map x x as input and outputs another feature map y y, as shown in (a). To add a ControlNet to such a block we lock the original block and create a trainable copy and connect them together using zero convolution layers, i.e., 1 × 1 1\\times 1 convolution with both weight and bias initialized to zero. Here c c is a conditioning vector that we wish to add to the network, as shown in (b).",
        "image": "/api/paper-assets/2302.05543v3/he.png"
      },
      {
        "id": "2302.05543v3-fig3",
        "figureNumber": 3,
        "caption": "Stable Diffusion’s U-net architecture connected with a ControlNet on the encoder blocks and middle block. The locked, gray blocks show the structure of Stable Diffusion V1.5 (or V2.1, as they use the same U-net architecture). The trainable blue blocks and the white zero convolution layers are added to build a ControlNet.",
        "image": "/api/paper-assets/2302.05543v3/sd.png"
      },
      {
        "id": "2302.05543v3-fig4",
        "figureNumber": 4,
        "caption": "The sudden convergence phenomenon. Due to the zero convolutions, ControlNet always predicts high-quality images during the entire training. At a certain step in the training process ( e.g., the 6133 steps marked in bold), the model suddenly learns to follow the input condition.",
        "image": "/api/paper-assets/2302.05543v3/train.png"
      },
      {
        "id": "2302.05543v3-fig5",
        "figureNumber": 5,
        "caption": "Effect of Classifier-Free Guidance (CFG) and the proposed CFG Resolution Weighting (CFG-RW).",
        "image": "/api/paper-assets/2302.05543v3/cfg.png"
      },
      {
        "id": "2302.05543v3-fig6",
        "figureNumber": 6,
        "caption": "Composition of multiple conditions. We present the application to use depth and pose simultaneously.",
        "image": "/api/paper-assets/2302.05543v3/multi.png"
      },
      {
        "id": "2302.05543v3-fig7",
        "figureNumber": 7,
        "caption": "Controlling Stable Diffusion with various conditions without prompts. The top row is input conditions, while all other rows are outputs. We use the empty string as input prompts. All models are trained with general-domain data. The model has to recognize semantic contents in the input condition images to generate images.",
        "image": "/api/paper-assets/2302.05543v3/imgs/qua.jpg"
      },
      {
        "id": "2302.05543v3-fig8",
        "figureNumber": 8,
        "caption": "Ablative study of different architectures on a sketch condition and different prompt settings. For each setting, we show a random batch of 6 samples without cherry-picking. Images are at 512 × \\times 512 and best viewed when zoomed in. The green “conv” blocks on the left are standard convolution layers initialized with Gaussian weights.",
        "image": "/api/paper-assets/2302.05543v3/ablat.png"
      },
      {
        "id": "2302.05543v3-fig9",
        "figureNumber": 9,
        "caption": "Comparison to previous methods.We present the qualitative comparisons to PITI [ 89 ], Sketch-Guided Diffusion [ 88 ], and Taming Transformers [ 19 ].",
        "image": "/api/paper-assets/2302.05543v3/compa.png"
      },
      {
        "id": "2302.05543v3-fig10",
        "figureNumber": 10,
        "caption": "The influence of different training dataset sizes. See also the supplementary material for extended examples.",
        "image": "/api/paper-assets/2302.05543v3/datasize.png"
      },
      {
        "id": "2302.05543v3-fig11",
        "figureNumber": 11,
        "caption": "Interpreting contents. If the input is ambiguous and the user does not mention object contents in prompts, the results look like the model tries to interpret input shapes.",
        "image": "/api/paper-assets/2302.05543v3/guess.png"
      },
      {
        "id": "2302.05543v3-fig12",
        "figureNumber": 12,
        "caption": "Transfer pretrained ControlNets to community models [ 16, 61 ] without training the neural networks again.",
        "image": "/api/paper-assets/2302.05543v3/trans.png"
      }
    ]
  },
  {
    "id": "https://openalex.org/W3138516171",
    "title": "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows",
    "year": 2021,
    "authors": [
      "Ze Liu",
      "Yutong Lin",
      "Yue Cao",
      "Han Hu",
      "Yixuan Wei",
      "Zheng Zhang",
      "Stephen Ching-Feng Lin",
      "Baining Guo"
    ],
    "venue": "IEEE/CVF International Conference on Computer Vision (ICCV)",
    "url": "https://doi.org/10.1109/iccv48922.2021.00986",
    "pdf": "",
    "arxivId": "2103.14030",
    "abstract": "This paper presents a new vision Transformer, called Swin Transformer, that capably serves as a general-purpose backbone for computer vision. Challenges in adapting Transformer from language to vision arise from differences between the two domains, such as large variations in the scale of visual entities and the high resolution of pixels in images compared to words in text. To address these differences, we propose a hierarchical Transformer whose representation is computed with Shifted windows. The shifted windowing scheme brings greater efficiency by limiting self-attention computation to non-overlapping local windows while also allowing for cross-window connection. This hierarchical architecture has the flexibility to model at various scales and has linear computational complexity with respect to image size. These qualities of Swin Transformer make it compatible with a broad range of vision tasks, including image classification (87.3 top-1 accuracy on ImageNet-1K) and dense prediction tasks such as object detection (58.7 box AP and 51.1 mask AP on COCO test-dev) and semantic segmentation (53.5 mIoU on ADE20K val). Its performance surpasses the previous state-of-the-art by a large margin of +2.7 box AP and +2.6 mask AP on COCO, and +3.2 mIoU on ADE20K, demonstrating the potential of Transformer-based models as vision backbones. The hierarchical design and the shifted window approach also prove beneficial for all-MLP architectures. The code and models are publicly available at https://github.com/microsoft/Swin-Transformer.",
    "figures": [
      {
        "id": "2103.14030v2-fig1",
        "figureNumber": 1,
        "caption": "(a) The proposed Swin Transformer builds hierarchical feature maps by merging image patches (shown in gray) in deeper layers and has linear computation complexity to input image size due to computation of self-attention only within each local window (shown in red). It can thus serve as a general-purpose backbone for both image classification and dense recognition tasks. (b) In contrast, previous vision Transformers [ 20 ] produce feature maps of a single low resolution and have quadratic computation complexity to input image size due to computation of self-attention globally.",
        "image": "/api/paper-assets/2103.14030v2/figs/teaser11.png"
      },
      {
        "id": "2103.14030v2-fig2",
        "figureNumber": 2,
        "caption": "An illustration of the shifted window approach for computing self-attention in the proposed Swin Transformer architecture. In layer l l (left), a regular window partitioning scheme is adopted, and self-attention is computed within each window. In the next layer l + 1 l+1 (right), the window partitioning is shifted, resulting in new windows. The self-attention computation in the new windows crosses the boundaries of the previous windows in layer l l, providing connections among them.",
        "image": "/api/paper-assets/2103.14030v2/figs/teaser_v4.png"
      }
    ]
  },
  {
    "id": "https://openalex.org/W3168867926",
    "title": "LoRA: Low-Rank Adaptation of Large Language Models",
    "year": 2022,
    "authors": [
      "J. Edward Hu",
      "Yelong Shen",
      "Phillip Wallis",
      "Zeyuan Allen-Zhu",
      "Yuanzhi Li",
      "Shean Wang",
      "Wang, Lu",
      "Chen, Weizhu"
    ],
    "venue": "International Conference on Learning Representations",
    "url": "https://openreview.net/forum?id=nZeVKeeFYf9",
    "pdf": "",
    "arxivId": "2106.09685",
    "abstract": "An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to particular tasks or domains. As we pre-train larger models, full fine-tuning, which retrains all model parameters, becomes less feasible. Using GPT-3 175B as an example -- deploying independent instances of fine-tuned models, each with 175B parameters, is prohibitively expensive. We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters for downstream tasks. Compared to GPT-3 175B fine-tuned with Adam, LoRA can reduce the number of trainable parameters by 10,000 times and the GPU memory requirement by 3 times. LoRA performs on-par or better than fine-tuning in model quality on RoBERTa, DeBERTa, GPT-2, and GPT-3, despite having fewer trainable parameters, a higher training throughput, and, unlike adapters, no additional inference latency. We also provide an empirical investigation into rank-deficiency in language model adaptation, which sheds light on the efficacy of LoRA. We release a package that facilitates the integration of LoRA with PyTorch models and provide our implementations and model checkpoints for RoBERTa, DeBERTa, and GPT-2 at https://github.com/microsoft/LoRA.",
    "figures": [
      {
        "id": "2106.09685v2-fig3",
        "figureNumber": 3,
        "caption": "Subspace similarity between column vectors of A r = 8 A_{r=8} and A r = 64 A_{r=64} for both Δ ​ W q \\Delta W_{q} and Δ ​ W v \\Delta W_{v}. The third and the fourth figures zoom in on the lower-left triangle in the first two figures. The top directions in r = 8 r=8 are included in r = 64 r=64, and vice versa.",
        "image": "/api/paper-assets/2106.09685v2/qv8_qv64.png"
      },
      {
        "id": "2106.09685v2-fig4",
        "figureNumber": 4,
        "caption": "Left and Middle: Normalized subspace similarity between the column vectors of A r = 64 A_{r=64} from two random seeds, for both Δ ​ W q \\Delta W_{q} and Δ ​ W v \\Delta W_{v} in the 48-th layer. Right: the same heat-map between the column vectors of two random Gaussian matrices. See Section H.1 for other layers.",
        "image": "/api/paper-assets/2106.09685v2/UA_across_random_seeds.png"
      },
      {
        "id": "2106.09685v2-fig5",
        "figureNumber": 5,
        "caption": "Percentage slow-down of inference latency compared to the no-adapter ( r = 0 r=0 ) baseline. The top row shows the result for Adapter H \\text{Adapter}^{\\text{H}} and the bottom row Adapter L \\text{Adapter}^{\\text{L}}. Larger batch size and sequence length help to mitigate the latency, but the slow-down can be as high as over 30% in an online, short-sequence-length scenario. We tweak the colormap for better visibility.",
        "image": "/api/paper-assets/2106.09685v2/latency.png"
      },
      {
        "id": "2106.09685v2-fig6",
        "figureNumber": 6,
        "caption": "Normalized subspace similarity between the column vectors of A r = 8 A_{r=8} and A r = 64 A_{r=64} for both Δ ​ W q \\Delta W_{q} and Δ ​ W v \\Delta W_{v} from the 1st, 32nd, 64th, and 96th layers in a 96-layer Transformer.",
        "image": "/api/paper-assets/2106.09685v2/qv8_qv64_more_layers.png"
      },
      {
        "id": "2106.09685v2-fig8",
        "figureNumber": 8,
        "caption": "Normalized subspace similarity between the singular directions of W q W_{q} and those of Δ ​ W q \\Delta W_{q} with varying r r and a random baseline. Δ ​ W q \\Delta W_{q} amplifies directions that are important but not emphasized in W W. Δ ​ W \\Delta W with a larger r r tends to pick up more directions that are already emphasized in W W.",
        "image": "/api/paper-assets/2106.09685v2/w_vs_delta_w.png"
      }
    ]
  },
  {
    "id": "https://openalex.org/W4318718936",
    "title": "BLIP-2: Bootstrapping Language-Image Pre-training with Frozen Image Encoders and Large Language Models",
    "year": 2023,
    "authors": [
      "Junnan Li",
      "Dongxu Li",
      "Silvio Savarese",
      "Steven C. H. Hoi"
    ],
    "venue": "International Conference on Machine Learning",
    "url": "https://proceedings.mlr.press/v202/li23q.html",
    "pdf": "https://proceedings.mlr.press/v202/li23q/li23q.pdf",
    "arxivId": "2301.12597",
    "abstract": "The cost of vision-and-language pre-training has become increasingly prohibitive due to end-to-end training of large-scale models. This paper proposes BLIP-2, a generic and efficient pre-training strategy that bootstraps vision-language pre-training from off-the-shelf frozen pre-trained image encoders and frozen large language models. BLIP-2 bridges the modality gap with a lightweight Querying Transformer, which is pre-trained in two stages. The first stage bootstraps vision-language representation learning from a frozen image encoder. The second stage bootstraps vision-to-language generative learning from a frozen language model. BLIP-2 achieves state-of-the-art performance on various vision-language tasks, despite having significantly fewer trainable parameters than existing methods. For example, our model outperforms Flamingo80B by 8.7% on zero-shot VQAv2 with 54x fewer trainable parameters. We also demonstrate the model's emerging capabilities of zero-shot image-to-text generation that can follow natural language instructions.",
    "figures": [
      {
        "id": "2301.12597v3-fig1",
        "figureNumber": 1,
        "caption": ": Overview of BLIP-2’s framework. We pre-train a lightweight Querying Transformer following a two-stage strategy to bridge the modality gap. The first stage bootstraps vision-language representation learning from a frozen image encoder. The second stage bootstraps vision-to-language generative learning from a frozen LLM, which enables zero-shot instructed image-to-text generation (see Figure 4 for more examples).",
        "image": "/api/paper-assets/2301.12597v3/fig1-example.png"
      },
      {
        "id": "2301.12597v3-fig2",
        "figureNumber": 2,
        "caption": ": ( Left ) Model architecture of Q-Former and BLIP-2’s first-stage vision-language representation learning objectives. We jointly optimize three objectives which enforce the queries (a set of learnable embeddings) to extract visual representation most relevant to the text. ( Right ) The self-attention masking strategy for each objective to control query-text interaction.",
        "image": "/api/paper-assets/2301.12597v3/fig2-v5.png"
      },
      {
        "id": "2301.12597v3-fig3",
        "figureNumber": 3,
        "caption": ": BLIP-2’s second-stage vision-to-language generative pre-training, which bootstraps from frozen large language models (LLMs). ( Top ) Bootstrapping a decoder-based LLM (e.g. OPT). ( Bottom ) Bootstrapping an encoder-decoder-based LLM (e.g. FlanT5). The fully-connected layer adapts from the output dimension of the Q-Former to the input dimension of the chosen LLM.",
        "image": "/api/paper-assets/2301.12597v3/fig3-v3.png"
      },
      {
        "id": "2301.12597v3-fig4",
        "figureNumber": 4,
        "caption": ": Selected examples of instructed zero-shot image-to-text generation using a BLIP-2 model w/ ViT-g and FlanT5 XXL {}_{\\text{XXL}}, where it shows a wide range of capabilities including visual conversation, visual knowledge reasoning, visual commensense reasoning, storytelling, personalized image-to-text generation, etc.",
        "image": "/api/paper-assets/2301.12597v3/examples.png"
      },
      {
        "id": "2301.12597v3-fig6",
        "figureNumber": 6,
        "caption": ": Incorrect output examples for instructed zero-shot image-to-text generation using a BLIP-2 model w/ ViT-g and FlanT5 XXL {}_{\\text{XXL}}.",
        "image": "/api/paper-assets/2301.12597v3/examples_limitation.png"
      },
      {
        "id": "2301.12597v3-fig7",
        "figureNumber": 7,
        "caption": ": Model architecture for VQA finetuning, where the LLM receives Q-Former’s output and the question as input, then predicts answers. We also provide the question as a condition to Q-Former, such that the extracted image features are more relevant to the question.",
        "image": "/api/paper-assets/2301.12597v3/fig-vqa.png"
      }
    ]
  }
];
